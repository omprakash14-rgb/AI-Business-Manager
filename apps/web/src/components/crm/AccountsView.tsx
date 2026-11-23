import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Plus,
  RefreshCw,
  Globe,
  Mail,
  Phone,
  Users,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import type {
  AccountDto,
  CreateAccountInput,
  PaginationMeta
} from '@ai-business-manager/shared';
import { formatDateTime } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';

export function AccountsView() {
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [industryFilter, setIndustryFilter] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountDto | null>(null);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAccounts = useCallback(async (targetPage = page, targetSearch = search, targetIndustry = industryFilter) => {
    setIsLoading(true);
    try {
      const res = await apiClient.getAccounts({
        page: targetPage,
        limit: 15,
        search: targetSearch || undefined,
        industry: targetIndustry || undefined
      });
      setAccounts(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load accounts', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, industryFilter]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setName('');
    setIndustry('');
    setWebsite('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNotes('');
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleOpenEdit = (a: AccountDto) => {
    setEditingAccount(a);
    setName(a.name);
    setIndustry(a.industry || '');
    setWebsite(a.website || '');
    setEmail(a.email || '');
    setPhone(a.phone || '');
    setAddress(a.address || '');
    setNotes(a.notes || '');
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingAccount) {
        await apiClient.updateAccount(editingAccount.id, {
          name: name.trim(),
          industry: industry.trim() || undefined,
          website: website.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined
        });
      } else {
        await apiClient.createAccount({
          name: name.trim(),
          industry: industry.trim() || undefined,
          website: website.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined
        });
      }
      setShowModal(false);
      loadAccounts();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, accName: string) => {
    if (!confirm(`Are you sure you want to soft-delete account "${accName}"?`)) return;
    try {
      await apiClient.deleteAccount(id);
      loadAccounts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Accounts & Companies Directory</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage client organizations, partner businesses, associated customer contacts, and operational relationship records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Account</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAccounts()}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              title="Refresh accounts"
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
              loadAccounts(1, v, industryFilter);
            }}
            placeholder="Search accounts by company name, industry, email, website..."
            filterValue={industryFilter}
            filterOptions={[
              { label: 'All Industries', value: '' },
              { label: 'Technology / Software', value: 'Technology' },
              { label: 'Financial Services', value: 'Finance' },
              { label: 'Healthcare', value: 'Healthcare' },
              { label: 'Manufacturing', value: 'Manufacturing' },
              { label: 'Retail / E-Commerce', value: 'Retail' },
              { label: 'Consulting / Professional Services', value: 'Consulting' },
            ]}
            onFilterChange={(v) => {
              setIndustryFilter(v);
              setPage(1);
              loadAccounts(1, search, v);
            }}
          />

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No accounts registered yet. Click &quot;New Account&quot; to add a customer company.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Company Name</th>
                      <th className="py-2.5 px-3">Industry</th>
                      <th className="py-2.5 px-3">Website</th>
                      <th className="py-2.5 px-3">Contacts</th>
                      <th className="py-2.5 px-3">Primary Contact Info</th>
                      <th className="py-2.5 px-3">Created</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accounts.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {a.name}
                        </td>
                        <td className="py-2.5 px-3">
                          {a.industry ? (
                            <Badge variant="outline" className="text-[10px] font-medium">
                              {a.industry}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                          {a.website ? (
                            <a
                              href={a.website.startsWith('http') ? a.website : `https://${a.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              <span>{a.website.replace(/^https?:\/\//, '')}</span>
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Users className="h-3 w-3 text-slate-500" />
                            <span>{a.contactCount || 0}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {a.email && <div>{a.email}</div>}
                          {a.phone && <div className="text-slate-400">{a.phone}</div>}
                          {!a.email && !a.phone && '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {formatDateTime(a.createdAt)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(a)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                              title="Edit account"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(a.id, a.name)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Soft-delete account"
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
                    loadAccounts(p);
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
                {editingAccount ? 'Edit Account' : 'New Account (Company)'}
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

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Innovations Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Industry</label>
                    <input
                      type="text"
                      placeholder="e.g. Technology"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Website</label>
                    <input
                      type="text"
                      placeholder="e.g. https://acme.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Corporate Email</label>
                    <input
                      type="email"
                      placeholder="info@acme.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Main Phone</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 012-3456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Office Address</label>
                  <input
                    type="text"
                    placeholder="100 Tech Boulevard, Suite 400"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Notes & Relationship History</label>
                  <textarea
                    rows={2}
                    placeholder="Important company background or SLA terms..."
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
                <Button type="submit" size="sm" disabled={isSubmitting || !name.trim()}>
                  {isSubmitting ? 'Saving...' : 'Save Account'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
