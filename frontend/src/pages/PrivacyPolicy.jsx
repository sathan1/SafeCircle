import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lock, 
  Shield, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Users, 
  ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import ContactSelector from '../components/privacy/ContactSelector';
import PermissionMatrix from '../components/privacy/PermissionMatrix';
import PermissionPreview from '../components/privacy/PermissionPreview';
import PermissionExplanation from '../components/privacy/PermissionExplanation';
import PermissionAuditLog from '../components/privacy/PermissionAuditLog';
import { contactService, DEFAULT_PERMISSIONS } from '../services/contactService';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  // Active matrix state for selected contact
  const [serverPermissions, setServerPermissions] = useState(null);
  const [editablePermissions, setEditablePermissions] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // UI state
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [auditLogs, setAuditLogs] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch all contacts first
  const loadContacts = useCallback(async () => {
    setIsLoadingContacts(true);
    setError(null);
    try {
      const data = await contactService.getContacts();
      setContacts(data);
      if (data.length > 0) {
        // Select first contact if none selected
        setSelectedContactId(prev => prev || data[0].id);
      }
    } catch (err) {
      setError('Unable to load Safety Circle contacts. Please verify backend connectivity.');
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // When selected contact changes, load their policy
  useEffect(() => {
    if (!selectedContactId) return;

    const currentContact = contacts.find(c => c.id === selectedContactId);
    setSelectedContact(currentContact || null);

    let isMounted = true;
    setIsLoadingPolicy(true);

    contactService.getContactPermissions(selectedContactId)
      .then(res => {
        if (!isMounted) return;
        const perms = res.permissions || DEFAULT_PERMISSIONS;
        setServerPermissions(perms);
        setEditablePermissions(JSON.parse(JSON.stringify(perms)));
        setHasChanges(false);
      })
      .catch(err => {
        if (!isMounted) return;
        // Fallback to contact's embedded permissions or default
        const fallback = currentContact?.permissions || DEFAULT_PERMISSIONS;
        setServerPermissions(fallback);
        setEditablePermissions(JSON.parse(JSON.stringify(fallback)));
        setHasChanges(false);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPolicy(false);
      });

    return () => { isMounted = false; };
  }, [selectedContactId, contacts]);

  // Toggle individual cell in editable permissions
  const handleTogglePermission = (state, infoType) => {
    if (!editablePermissions) return;

    setEditablePermissions(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[state][infoType] = !next[state][infoType];

      // Check if changes exist compared to serverPermissions
      const isDifferent = JSON.stringify(next) !== JSON.stringify(serverPermissions);
      setHasChanges(isDifferent);

      return next;
    });
  };

  // Cancel unsaved edits
  const handleCancel = () => {
    if (serverPermissions) {
      setEditablePermissions(JSON.parse(JSON.stringify(serverPermissions)));
      setHasChanges(false);
    }
  };

  // Save changes to backend
  const handleSave = async () => {
    if (!selectedContactId || !editablePermissions) return;
    setIsSaving(true);
    try {
      const updated = await contactService.updateContactPermissions(selectedContactId, editablePermissions);
      setServerPermissions(updated.permissions);
      setEditablePermissions(JSON.parse(JSON.stringify(updated.permissions)));
      setHasChanges(false);
      showToast('Privacy permissions updated.');

      // Add to audit log
      const newLog = {
        id: `log-${Date.now()}`,
        title: 'Permissions Matrix Updated',
        contact: selectedContact?.name || 'Contact',
        info: 'Custom Policy',
        state: 'Configured',
        action: 'Saved',
        time: 'Just now'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    } catch (err) {
      showToast('Unable to update privacy permissions.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Restore recommended default policy
  const handleRestoreDefaults = async () => {
    if (!selectedContactId) return;
    setIsSaving(true);
    try {
      const restored = await contactService.restoreDefaultPermissions(selectedContactId);
      setServerPermissions(restored.permissions);
      setEditablePermissions(JSON.parse(JSON.stringify(restored.permissions)));
      setHasChanges(false);
      showToast('Privacy permissions updated.');

      const newLog = {
        id: `log-${Date.now()}`,
        title: 'Recommended Policy Restored',
        contact: selectedContact?.name || 'Contact',
        info: 'Default Template',
        state: 'ALL',
        action: 'Applied',
        time: 'Just now'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    } catch (err) {
      showToast('Unable to restore default policy.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 inline-block mb-1.5">
            Privacy Permission Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            You decide what each trusted contact can access at every safety stage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadContacts}
            icon={RefreshCw}
            disabled={isLoadingContacts}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Loading / Error / Empty States */}
      {isLoadingContacts ? (
        <Card className="py-16 text-center">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">Loading Privacy Engine...</h3>
          <p className="text-xs text-stone-400 mt-1">Fetching contacts and permission rules</p>
        </Card>
      ) : error ? (
        <Card className="py-12 text-center border-rose-200 bg-rose-50/20">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900 mb-1">
            Unable to load Privacy Engine
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5">
            {error}
          </p>
          <Button onClick={loadContacts} variant="secondary" size="sm" icon={RefreshCw}>
            Retry Connection
          </Button>
        </Card>
      ) : contacts.length === 0 ? (
        <Card className="py-16 text-center border-2 border-dashed border-stone-200 bg-white/70">
          <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-2xs">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            Your Safety Circle is Empty
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6 leading-relaxed">
            You must add at least one trusted contact to your Safety Circle before you can configure personalized privacy permissions.
          </p>
          <Button onClick={() => navigate('/safety-circle')} size="md">
            <span>Manage Safety Circle</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Card>
      ) : (
        /* Functional Privacy Layout */
        <div className="space-y-6">
          {/* 1. Contact Selector */}
          <ContactSelector
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={(id) => {
              if (hasChanges) {
                const proceed = window.confirm('You have unsaved changes. Switch contact and discard changes?');
                if (!proceed) return;
              }
              setSelectedContactId(id);
            }}
          />

          {/* 2. Permission Matrix for Selected Contact */}
          {isLoadingPolicy ? (
            <Card className="py-12 text-center">
              <RefreshCw className="w-6 h-6 text-rose-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-stone-500">Loading permission matrix for {selectedContact?.name}...</p>
            </Card>
          ) : (
            <PermissionMatrix
              contact={selectedContact}
              permissions={editablePermissions}
              hasChanges={hasChanges}
              onTogglePermission={handleTogglePermission}
              onSave={handleSave}
              onCancel={handleCancel}
              onRestoreDefaults={handleRestoreDefaults}
              isSaving={isSaving}
            />
          )}

          {/* 3. Permission Preview & Explanation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PermissionPreview
              contact={selectedContact}
              permissions={editablePermissions}
            />

            <PermissionExplanation />
          </div>

          {/* 4. Audit Log */}
          <PermissionAuditLog recentLogs={auditLogs} />
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default PrivacyPolicy;
