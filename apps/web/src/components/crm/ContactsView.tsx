import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Plus,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import type {
  ContactDto,
  AccountDto,
  CreateContactInput,
  PaginationMeta
} from '@ai-business-manager/shared';
import { formatDateTime } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';

export function ContactsView() {
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactDto | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [modalAccountId, setModalAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadContacts = useCallback(async (targetPage = page, targetSearch = search, targetAccount = selectedAccountId) => {
    setIsLoading(true);
    try {
      const res = await apiClient.getContacts({
        page: targetPage,
        limit: 15,
        search: targetSearch || undefined,
        accountId: targetAccount || undefined
      });
      setContacts(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load contacts', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedAccountId]);

  useEffect(() => {
    loadContacts();
    apiClient.getAccounts({ limit: 100 }).then((res) => setAccounts(res.items)).catch(() => []);
  }, [loadContacts]);

  const handleOpenCreate = () => {
    setEditingContact(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setJobTitle('');
    setModalAccountId('');
    setNotes('');
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleOpenEdit = (c: ContactDto) => {
    setEditingContact(c);
    setFirstName(c.firstName);
    setLastName(c.lastName);
    setEmail(c.email || '');
    setPhone(c.phone || '');
    setJobTitle(c.jobTitle || '');
    setModalAccountId(c.accountId || '');
    setNotes(c.notes || '');
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingContact) {
        await apiClient.updateContact(editingContact.id, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          jobTitle: jobTitle.trim() || undefined,
          accountId: modalAccountId || null,
          notes: notes.trim() || undefined
        });
      } else {
        await apiClient.createContact({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          jobTitle: jobTitle.trim() || undefined,
          accountId: modalAccountId || null,
          notes: notes.trim() || undefined
        });
      }
      setShowModal(false);
      loadContacts();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to soft-delete contact "${name}"?`)) return;
    try {
      await apiClient.deleteContact(id);
      loadContacts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" />
              <span>Customer Contacts Directory</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage individual customer contacts, business representatives, and their company relationships.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Contact</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadContacts()}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              title="Refresh contacts"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <SearchFilterBar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
              loadContacts(1, v, selectedAccountId);
            }}
            placeholder="Search contacts by name, email, phone, title..."
            filterValue={selectedAccountId}
            filterOptions={[
              { label: 'All Companies', value: '' },
              ...accounts.map((a) => ({ label: a.name, value: a.id }))
            ]}
            onFilterChange={(v) => {
              setSelectedAccountId(v);
              setPage(1);
              loadContacts(1, search, v);
            }}
          />

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No contacts found. Click &quot;New Contact&quot; to add a customer record.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Contact Name</th>
                      <th className="py-2.5 px-3">Company / Account</th>
                      <th className="py-2.5 px-3">Job Title</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Created</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contacts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {c.firstName} {c.lastName}
                        </td>
                        <td className="py-2.5 px-3">
                          {c.accountName ? (
                            <span className="inline-flex items-center gap-1 font-medium text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              <Building2 className="h-3 w-3 text-slate-500" />
                              <span>{c.accountName}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {c.jobTitle || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                          {c.email || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                          {c.phone || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {formatDateTime(c.createdAt)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                              title="Edit contact"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id, `${c.firstName} ${c.lastName}`)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Soft-delete contact"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && (
                <PaginationBar
                  pagination={pagination}
                  onPageChange={(p) => {
                    setPage(p);
                    loadContacts(p);
                  }}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border-slate-200 bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                {editingContact ? 'Edit Contact' : 'New Contact Record'}
              </CardTitle>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-3 pt-4 text-xs">
                {errorMessage && (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-2 text-rose-800">
                    {errorMessage}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Associated Account (Company)</label>
                  <select
                    value={modalAccountId}
                    onChange={(e) => setModalAccountId(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                  >
                    <option value="">-- Independent Contact (No Company) --</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Job Title / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Engineer, VP Sales"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t border-slate-100 p-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting || !firstName.trim() || !lastName.trim()}>
                  {isSubmitting ? 'Saving...' : 'Save Contact'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
