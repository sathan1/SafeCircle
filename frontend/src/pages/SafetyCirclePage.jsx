import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ContactCard from '../components/ContactCard';
import ContactModal from '../components/ContactModal';
import ConfirmModal from '../components/ConfirmModal';
import Card from '../components/Card';
import contactService from '../services/contactService';
import { Users, UserPlus, Info } from 'lucide-react';

const SafetyCirclePage = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const data = await contactService.getContacts();
      setContacts(data);
    } catch (err) {
      setError('Failed to load your safety circle.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = () => {
    setSelectedContact(null);
    setIsContactModalOpen(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (contactData) => {
    if (selectedContact) {
      await contactService.updateContact(selectedContact._id, contactData);
    } else {
      await contactService.createContact(contactData);
    }
    await fetchContacts();
  };

  const handleDeleteRequest = (contact) => {
    setContactToDelete(contact);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    try {
      await contactService.deleteContact(contactToDelete._id);
      await fetchContacts();
      setIsConfirmModalOpen(false);
      setContactToDelete(null);
    } catch (err) {
      alert('Failed to delete contact');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 font-medium">Loading your safety circle...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Your Safety Circle" 
        description="Choose who can support you when your safety state changes."
        actions={
          <Button icon={UserPlus} onClick={handleAddContact}>Add Person</Button>
        }
      />

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Privacy Information Card */}
      <Card className="bg-rose-50/70 border-rose-100 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-800">
            <strong>Privacy Note:</strong> Adding someone to your Safety Circle does not automatically share your location. You control what each person can access through Privacy Policy.
          </p>
        </div>
      </Card>

      {contacts.length === 0 ? (
        <EmptyState 
          icon={Users}
          title="Your Safety Circle is empty."
          description="Add trusted people who can support you when you need them."
          action={
            <Button onClick={handleAddContact}>
              + Add Person
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <ContactCard 
              key={contact._id} 
              contact={contact} 
              onEdit={handleEditContact}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSave={handleSaveContact}
        contact={selectedContact}
      />

      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Contact"
        message={`Remove ${contactToDelete?.name} from your Safety Circle?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SafetyCirclePage;
