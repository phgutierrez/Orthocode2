import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { PrivatePackage, ProcedurePackage } from '@/types/package';
import type { NotificationData } from './useNotifications';

interface UsePackageSharingProps {
  packages: ProcedurePackage[];
  privatePackages: PrivatePackage[];
  addPackage: (data: Omit<ProcedurePackage, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ProcedurePackage | null>;
  addPrivatePackage: (data: Omit<PrivatePackage, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PrivatePackage | null>;
  deleteNotification: (id: string) => Promise<void>;
}

export function usePackageSharing({
  packages,
  privatePackages,
  addPackage,
  addPrivatePackage,
  deleteNotification,
}: UsePackageSharingProps) {
  const { user } = useAuth();

  const sharePackage = async (packageId: string, toUserId: string, packageType: 'standard' | 'private') => {
    if (!user?.id) return;

    const { error: shareError } = await supabase
      .from('shared_packages')
      .insert({
        package_id: packageId,
        package_type: packageType,
        from_user_id: user.id,
        to_user_id: toUserId,
        status: 'pending',
      });

    if (shareError) throw shareError;

    const pkg = packageType === 'private'
      ? privatePackages.find((p) => p.id === packageId)
      : packages.find((p) => p.id === packageId);

    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: toUserId,
        type: 'package_share',
        data: {
          package_id: packageId,
          package_name: pkg?.name,
          package_type: packageType,
          from_user_name: user.name,
          from_user_id: user.id,
        },
      });

    if (notifError) throw notifError;
  };

  const acceptShare = async (notificationId: string, shareData: NotificationData | unknown) => {
    if (!user?.id) return;

    let parsedData = shareData;
    if (typeof shareData === 'string') {
      parsedData = JSON.parse(shareData);
    }
    const data = parsedData as NotificationData;
    const packageId = data?.package_id;
    const packageType = data?.package_type ?? 'standard';

    if (!packageId) {
      throw new Error('ID do pacote não encontrado na notificação');
    }

    const selectFields = packageType === 'private'
      ? '*, private_package_procedures(procedure_code), private_package_opmes(opme_id)'
      : '*, package_procedures(procedure_code)';

    const { data: packageData, error: fetchError } = await supabase
      .from(packageType === 'private' ? 'private_packages' : 'packages')
      .select(selectFields)
      .eq('id', packageId);

    if (fetchError) throw fetchError;
    if (!packageData || packageData.length === 0) {
      throw new Error(`Pacote com ID ${packageId} não encontrado`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sharedPkg = (packageData as any[])[0];
    const procedureIds = packageType === 'private'
      ? sharedPkg.private_package_procedures?.map((p: { procedure_code: string }) => p.procedure_code) || []
      : sharedPkg.package_procedures?.map((p: { procedure_code: string }) => p.procedure_code) || [];

    const payload = {
      name: sharedPkg.name,
      description: sharedPkg.description || '',
      procedureIds,
    };

    if (packageType === 'private') {
      const opmeIds = sharedPkg.private_package_opmes?.map((o: { opme_id: string }) => o.opme_id) || [];
      await addPrivatePackage({
        ...payload,
        opmeIds,
        surgeonValue: sharedPkg.surgeon_value ?? 0,
        anesthetistValue: sharedPkg.anesthetist_value ?? 0,
        assistantValue: sharedPkg.assistant_value ?? 0,
      });
    } else {
      await addPackage(payload);
    }

    const updateShare = supabase
      .from('shared_packages')
      .update({ status: 'accepted' })
      .eq('package_id', packageId)
      .eq('to_user_id', user.id);

    if (packageType) {
      updateShare.eq('package_type', packageType);
    }

    await updateShare;
    await deleteNotification(notificationId);
  };

  const rejectShare = async (notificationId: string, shareData: NotificationData | unknown) => {
    if (!user?.id) return;

    let parsedData = shareData;
    if (typeof shareData === 'string') {
      parsedData = JSON.parse(shareData);
    }
    const data = parsedData as NotificationData;

    const updateShare = supabase
      .from('shared_packages')
      .update({ status: 'rejected' })
      .eq('package_id', data?.package_id)
      .eq('to_user_id', user.id);

    if (data?.package_type) {
      updateShare.eq('package_type', data.package_type);
    }

    await updateShare;
    await deleteNotification(notificationId);
  };

  return {
    sharePackage,
    acceptShare,
    rejectShare,
  };
}
