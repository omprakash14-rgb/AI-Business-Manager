import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DepartmentDto,
  DesignationDto,
  CreateDepartmentInput,
  CreateDesignationInput
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  Building,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Users,
  X,
  AlertCircle
} from 'lucide-react';

interface DepartmentsViewProps {
  departments: DepartmentDto[];
  designations: DesignationDto[];
  onRefresh: () => void;
  isAdmin: boolean;
}

export function DepartmentsView({
  departments,
  designations,
  onRefresh,
  isAdmin
}: DepartmentsViewProps) {
  // Department modal state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDto | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Designation modal state
  const [isDesModalOpen, setIsDesModalOpen] = useState(false);
  const [editingDes, setEditingDes] = useState<DesignationDto | null>(null);
  const [desTitle, setDesTitle] = useState('');
  const [desCode, setDesCode] = useState('');
  const [desDeptId, setDesDeptId] = useState('');
  const [desDesc, setDesDesc] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open department modal
  const handleOpenDeptModal = (dept?: DepartmentDto) => {
    if (dept) {
      setEditingDept(dept);
      setDeptName(dept.name);
      setDeptCode(dept.code || '');
      setDeptDesc(dept.description || '');
    } else {
      setEditingDept(null);
      setDeptName('');
      setDeptCode('');
      setDeptDesc('');
    }
    setError(null);
    setIsDeptModalOpen(true);
  };

  // Submit department
  const handleSubmitDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) {
      setError('Department name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingDept) {
        await apiClient.updateDepartment(editingDept.id, {
          name: deptName.trim(),
          code: deptCode.trim() || undefined,
          description: deptDesc.trim() || undefined
        });
      } else {
        await apiClient.createDepartment({
          name: deptName.trim(),
          code: deptCode.trim() || undefined,
          description: deptDesc.trim() || undefined
        });
      }
      setIsDeptModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save department');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete department
  const handleDeleteDept = async (id: string, name: string) => {
    if (!window.confirm(`Delete department "${name}"? Employees in this department will be unassigned.`)) {
      return;
    }
    try {
      await apiClient.deleteDepartment(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete department');
    }
  };

  // Open designation modal
  const handleOpenDesModal = (des?: DesignationDto) => {
    if (des) {
      setEditingDes(des);
      setDesTitle(des.title);
      setDesCode(des.code || '');
      setDesDeptId(des.departmentId || '');
      setDesDesc(des.description || '');
    } else {
      setEditingDes(null);
      setDesTitle('');
      setDesCode('');
      setDesDeptId('');
      setDesDesc('');
    }
    setError(null);
    setIsDesModalOpen(true);
  };

  // Submit designation
  const handleSubmitDes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desTitle.trim()) {
      setError('Designation title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingDes) {
        await apiClient.updateDesignation(editingDes.id, {
          title: desTitle.trim(),
          code: desCode.trim() || undefined,
          departmentId: desDeptId || undefined,
          description: desDesc.trim() || undefined
        });
      } else {
        await apiClient.createDesignation({
          title: desTitle.trim(),
          code: desCode.trim() || undefined,
          departmentId: desDeptId || undefined,
          description: desDesc.trim() || undefined
        });
      }
      setIsDesModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save designation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete designation
  const handleDeleteDes = async (id: string, title: string) => {
    if (!window.confirm(`Delete designation "${title}"?`)) return;
    try {
      await apiClient.deleteDesignation(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete designation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Departments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              <span>Departments ({departments.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Organizational units and functional divisions across the enterprise
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => handleOpenDeptModal()}
              size="sm"
              className="bg-blue-600 text-white text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Department</span>
            </Button>
          )}
        </div>

        {departments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Building className="h-8 w-8 mx-auto text-slate-300 mb-1" />
            <p>No departments configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 p-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{dept.name}</span>
                    {dept.code && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-mono text-slate-700">
                        {dept.code}
                      </span>
                    )}
                  </div>
                  {dept.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                      {dept.description}
                    </p>
                  )}
                  {dept.managerName && (
                    <div className="text-[11px] text-slate-600 mb-2">
                      Lead: <span className="font-medium text-slate-800">{dept.managerName}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{dept.employeeCount} employee(s)</span>
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenDeptModal(dept)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Edit department"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDept(dept.id, dept.name)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete department"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section: Designations */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-purple-600" />
              <span>Designations & Job Positions ({designations.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized job titles and role specifications within departments
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => handleOpenDesModal()}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Designation</span>
            </Button>
          )}
        </div>

        {designations.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Briefcase className="h-8 w-8 mx-auto text-slate-300 mb-1" />
            <p>No designations configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs bg-white">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Job Title & Code</th>
                  <th className="py-2.5 px-4 font-semibold">Department</th>
                  <th className="py-2.5 px-4 font-semibold">Description</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Employees</th>
                  {isAdmin && <th className="py-2.5 px-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {designations.map((des) => (
                  <tr key={des.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{des.title}</div>
                      {des.code && (
                        <div className="text-[11px] font-mono text-slate-400">{des.code}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {des.departmentName ? (
                        <span className="font-medium">{des.departmentName}</span>
                      ) : (
                        <span className="text-slate-400">Organization-Wide</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px] max-w-sm truncate">
                      {des.description || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-center font-semibold text-purple-700">
                      {des.employeeCount}
                    </td>
                    {isAdmin && (
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDesModal(des)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Edit designation"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDes(des.id, des.title)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete designation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Department Create/Edit */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h3>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitDept} className="p-5 space-y-3.5 text-xs">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Engineering, Sales, Human Resources"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Code (Optional)</label>
                <input
                  type="text"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="e.g. ENG, MKT"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  placeholder="Department scope and responsibilities..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeptModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white"
                >
                  {isSubmitting ? 'Saving...' : editingDept ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Designation Create/Edit */}
      {isDesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingDes ? 'Edit Designation' : 'Create Designation'}
              </h3>
              <button
                onClick={() => setIsDesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitDes} className="p-5 space-y-3.5 text-xs">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Designation / Job Title *</label>
                <input
                  type="text"
                  required
                  value={desTitle}
                  onChange={(e) => setDesTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer, Account Manager"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Department</label>
                <select
                  value={desDeptId}
                  onChange={(e) => setDesDeptId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Organization-Wide / Any --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Code (Optional)</label>
                <input
                  type="text"
                  value={desCode}
                  onChange={(e) => setDesCode(e.target.value)}
                  placeholder="e.g. SWE-III, AE"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={desDesc}
                  onChange={(e) => setDesDesc(e.target.value)}
                  placeholder="Role responsibilities..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDesModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmitting ? 'Saving...' : editingDes ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
