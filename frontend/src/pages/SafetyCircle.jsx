import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  UserX, 
  Lock, 
  Sparkles,
  Info
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import ContactCard from '../components/safety-circle/ContactCard';
import ContactModal from '../components/safety-circle/ContactModal';
import DeleteContactDialog from '../components/safety-circle/DeleteContactDialog';
import { contactService } from '../services/contactService';

const SafetyCircle = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contactService.getContacts();
      setContacts(data);
    } catch (err) {
      setError('Unable to load your Safety Circle. Please verify that the backend is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Add / Edit Handlers
  const handleOpenAddModal = () => {
    setContactToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact) => {
    setContactToEdit(contact);
    setIsModalOpen(true);
  };

  const handleSaveContact = async (contactData) => {
    setIsSubmitting(true);
    try {
      if (contactToEdit) {
        const updated = await contactService.updateContact(contactToEdit.id, contactData);
        setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
        showToast('Contact updated');
      } else {
        const created = await contactService.createContact(contactData);
        setContacts(prev => [...prev, created].sort((a, b) => a.priority - b.priority));
        showToast('Contact added');
      }
      setIsModalOpen(false);
      setContactToEdit(null);
    } catch (err) {
      showToast(err.message || 'Failed to save contact', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active / Inactive Status
  const handleToggleStatus = async (contact) => {
    try {
      const nextStatus = !contact.isActive;
      const updated = await contactService.toggleContactStatus(contact.id, nextStatus);
      setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
      showToast('Contact status updated');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Delete Handlers
  const handleOpenDeleteDialog = (contact) => {
    setContactToDelete(contact);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (id) => {
    setIsDeleting(true);
    try {
      await contactService.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      showToast('Contact removed');
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
    } catch (err) {
      showToast('Failed to remove contact', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats calculation
  const totalCount = contacts.length;
  const activeCount = contacts.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 inline-block mb-1.5">
            Circle Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            SAFETY CIRCLE
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            People you trust to receive safety information according to your privacy policy.
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          icon={Plus}
          size="md"
        >
          Add Person
        </Button>
      </div>

      {/* Stats & Architectural Principle Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 py-4 bg-white border-stone-200/80">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-extrabold text-lg border border-rose-100">
            {totalCount}
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Trusted Contacts
            </div>
            <div className="text-sm font-bold text-stone-900">
              Registered in Circle
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-4 bg-white border-stone-200/80">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-lg border border-emerald-100">
            {activeCount}
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Active Contacts
            </div>
            <div className="text-sm font-bold text-stone-900">
              Eligible for Alerts
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 py-4 bg-[#fcf8f8] border-stone-200/70">
          <div className="w-10 h-10 rounded-xl bg-white text-rose-600 border border-stone-200 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs text-stone-600 leading-snug">
            <strong className="text-stone-900 block font-semibold">Circle ≠ Permission</strong>
            Being in the circle does not grant raw location. Permissions are evaluated per safety state.
          </div>
        </Card>
      </div>

      {/* Main Content Area: Loading / Error / Empty / Grid */}
      {isLoading ? (
        <Card className="py-16 text-center">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">Loading your Safety Circle...</h3>
          <p className="text-xs text-stone-400 mt-1">Connecting to backend repository</p>
        </Card>
      ) : error ? (
        <Card className="py-12 text-center border-rose-200 bg-rose-50/20">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900 mb-1">
            Unable to load your Safety Circle
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5">
            {error}
          </p>
          <Button
            onClick={fetchContacts}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
          >
            Retry Connection
          </Button>
        </Card>
      ) : contacts.length === 0 ? (
        /* Empty State */
        <Card className="py-16 text-center border-2 border-dashed border-stone-200 bg-white/70">
          <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-2xs">
            <UserX className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            Your Safety Circle is empty
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6 leading-relaxed">
            Add people you trust to receive safety notifications and progressive emergency alerts during your journeys.
          </p>
          <Button
            onClick={handleOpenAddModal}
            icon={Plus}
            size="md"
          >
            Add Person
          </Button>
        </Card>
      ) : (
        /* Contacts List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleOpenEditModal}
              onToggleStatus={handleToggleStatus}
              onDelete={handleOpenDeleteDialog}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setContactToEdit(null);
        }}
        onSubmit={handleSaveContact}
        contactToEdit={contactToEdit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteContactDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setContactToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        contact={contactToDelete}
        isDeleting={isDeleting}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default SafetyCircle;
