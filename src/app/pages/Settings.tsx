import { useUserContext } from '../../hooks/useUserContext';
import { useAuth } from '../../hooks/useAuth';
import { User, Shield, Info, UserCircle } from 'lucide-react';
import { useState } from 'react';
import Toggle from '../../imports/Toggle';
import { PageHeader } from '../components/PageHeader';
import { Tutorial, useTutorial } from '../components/Tutorial';
import { tutorialMetadata } from '../data/tutorials';

export function Settings() {
  const { userContext } = useUserContext();
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const { isOpen: isTutorialOpen, openTutorial, handleClose: closeTutorial } = useTutorial('settings');

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Settings"
        showFavorite
        showMenu
        onTutorialClick={openTutorial}
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-[#1a1a1a] border border-[#242526] rounded-lg p-5" data-tutorial="profile">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <h2 className="text-sm font-medium text-foreground">Account Information</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-secondary-foreground">Account Type</label>
                  <div className="flex items-center gap-2 mt-1">
                    {userContext?.isAdmin ? (
                      <>
                        <Shield className="w-3.5 h-3.5 text-accent" />
                        <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
                          Admin
                        </span>
                      </>
                    ) : (
                      <>
                        <UserCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-secondary-foreground bg-muted/50 px-2.5 py-0.5 rounded-full">
                          User
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-secondary-foreground">Groups</label>
                  {userContext?.groups && userContext.groups.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {userContext.groups.map((group) => (
                        <span
                          key={group}
                          className="px-2 py-0.5 bg-muted/50 text-secondary-foreground rounded text-[10px] font-medium"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">None</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-secondary-foreground">User ID</label>
                  <p className="text-xs text-foreground mt-1">
                    {userContext?.userId || 'Loading...'}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-secondary-foreground">Email</label>
                  <p className="text-xs text-foreground mt-1">
                    {user?.signInDetails?.loginId || user?.userId || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-secondary-foreground">Tenant ID</label>
                  <p className="text-xs text-foreground mt-1">
                    {userContext?.tenantId || 'Loading...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Status */}
            {userContext?.isAdmin && (
              <div className="bg-[#1a1a1a] border border-[#242526] rounded-lg p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-accent/10 rounded flex items-center justify-center">
                    <Shield className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="text-sm font-medium text-foreground">Admin Access</h2>
                </div>

                <p className="text-xs text-secondary-foreground">
                  You have administrator privileges. This grants you access to manage voices and
                  tenant settings.
                </p>

                {userContext.groups.length > 0 && (
                  <div className="mt-4">
                    <label className="text-xs font-medium text-secondary-foreground">Groups</label>
                    <div className="flex gap-2 mt-2">
                      {userContext.groups.map((group) => (
                        <span
                          key={group}
                          className="px-2 py-0.5 bg-accent/10 text-accent rounded text-[10px] font-medium"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* API Information */}
            <div className="bg-[#1a1a1a] border border-[#242526] rounded-lg p-5" data-tutorial="api">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <Info className="w-4 h-4 text-muted-foreground" />
                </div>
                <h2 className="text-sm font-medium text-foreground">API Information</h2>
              </div>

              <p className="text-xs text-secondary-foreground">
                For API access and integration information, please contact support or refer to the
                documentation.
              </p>
            </div>

            {/* Preferences */}
            <div className="bg-[#1a1a1a] border border-[#242526] rounded-lg p-5" data-tutorial="notifications">
              <h2 className="text-sm font-medium text-foreground mb-4">Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-xs font-medium text-foreground">Email Notifications</p>
                    <p className="text-[10px] text-muted-foreground">Receive updates about your account</p>
                  </div>
                  <Toggle
                    checked={emailNotifications}
                    onChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">Auto-save Settings</p>
                    <p className="text-[10px] text-muted-foreground">Automatically save synthesis settings</p>
                  </div>
                  <Toggle
                    checked={autoSave}
                    onChange={setAutoSave}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tutorial
        steps={tutorialMetadata.settings.steps}
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />
    </div>
  );
}