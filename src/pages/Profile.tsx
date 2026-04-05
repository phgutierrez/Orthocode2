import { useMemo, useState } from "react";
import { Bell, LogOut, Moon, User, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { PageShell } from "@/components/PageShell";
import { SidebarNav } from "@/components/SidebarNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { usePackageSharing } from "@/hooks/usePackageSharing";
import { usePackages } from "@/hooks/usePackages";
import { usePrivatePackages } from "@/hooks/usePrivatePackages";
import { toast } from "@/components/ui/use-toast";
import { NotificationsModal } from "./packages/NotificationsModal";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { notifications, unreadCount, deleteNotification } = useNotifications();
  const { packages, addPackage } = usePackages();
  const { packages: privatePackages, addPackage: addPrivatePackage } = usePrivatePackages();
  const { acceptShare, rejectShare } = usePackageSharing({
    packages,
    privatePackages,
    addPackage,
    addPrivatePackage,
    deleteNotification,
  });
  const [showNotifications, setShowNotifications] = useState(false);

  const isDark = (resolvedTheme || theme) === "dark";

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleAcceptShare = async (notificationId: string, shareData: Notification["data"]) => {
    try {
      await acceptShare(notificationId, shareData);
      toast({
        title: "Pacote adicionado",
        description: "O pacote foi adicionado aos seus pacotes.",
      });
    } catch (error: unknown) {
      toast({
        title: "Erro ao aceitar",
        description: error instanceof Error ? error.message : "Nao foi possivel adicionar o pacote.",
      });
    }
  };

  const handleRejectShare = async (notificationId: string, shareData: Notification["data"]) => {
    try {
      await rejectShare(notificationId, shareData);
      toast({
        title: "Compartilhamento recusado",
        description: "A solicitacao foi removida.",
      });
    } catch (error: unknown) {
      toast({
        title: "Erro ao rejeitar",
        description: error instanceof Error ? error.message : "Nao foi possivel recusar o compartilhamento.",
      });
    }
  };

  const features = useMemo(
    () => [
      "Busca inteligente por TUSS, CBHPM e palavras-chave",
      "Favoritos sincronizados e pacotes personalizados",
      "Pacotes particulares com valores de honorarios",
      "Gerenciamento de OPMEs e compartilhamento",
      "Modo escuro e uso offline com PWA",
    ],
    []
  );

  return (
    <>
      <PageShell
        header={
          <div className="flex items-center justify-between max-w-5xl">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-semibold text-foreground">Perfil</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>
        }
        headerClassName="bg-muted/30"
        containerClassName="max-w-5xl"
        mainClassName="pb-24"
        sidebar={<SidebarNav />}
        context={
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Atalhos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                Ir para Busca
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/packages")}>
                Ver Pacotes
              </Button>
            </CardContent>
          </Card>
        }
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Logado como</div>
                  <div className="text-base font-medium text-foreground">
                    {user.name || user.email}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Voce nao esta logado.
                </div>
              )}
              <div className="flex gap-2">
                {!user && (
                  <Button onClick={() => navigate("/auth")}>Entrar</Button>
                )}
                {user && (
                  <Button variant="outline" className="gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferencias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Modo escuro</span>
                </div>
                <Switch
                  checked={isDark}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Notificacoes de compartilhamento</div>
                <Button variant="ghost" size="sm" onClick={() => setShowNotifications(true)}>
                  Ver notificacoes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Sobre o Pacotes TUSS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Pacotes TUSS e um gerenciador de procedimentos medicos com busca,
                favoritos e pacotes para uso clinico rapido.
              </p>
              <ul className="list-disc list-inside space-y-1">
                {features.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </PageShell>

      <NotificationsModal
        open={showNotifications}
        notifications={notifications}
        onClose={() => setShowNotifications(false)}
        onAccept={(id, data) => {
          handleAcceptShare(id, data);
          setShowNotifications(false);
        }}
        onReject={(id, data) => handleRejectShare(id, data)}
      />
    </>
  );
}
