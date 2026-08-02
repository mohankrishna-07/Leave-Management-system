import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';
import { FaUserPlus, FaSearch, FaEdit, FaTrashAlt, FaBuilding, FaEnvelope, FaUser, FaKey, FaList } from 'react-icons/fa';

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal forms states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedId, setSelectedId] = useState(null);
  
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('EMPLOYEE');
  const [formDepartment, setFormDepartment] = useState('');
  const [formLeaveBalance, setFormLeaveBalance] = useState(30);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/admin/employees`, {
        params: {
          search: search.trim() || undefined,
          page,
          size: 5,
        },
      });
      setEmployees(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to load employees', error);
      setToast({ message: 'Error loading employees list', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0); // Reset to page 0 on search
  };

  const handleAddClick = () => {
    setModalMode('add');
    setSelectedId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('EMPLOYEE');
    setFormDepartment('');
    setFormLeaveBalance(30);
    setShowModal(true);
  };

  const handleEditClick = (emp) => {
    setModalMode('edit');
    setSelectedId(emp.id);
    setFormName(emp.name);
    setFormEmail(emp.email);
    setFormPassword(''); // Empty by default
    setFormRole(emp.role);
    setFormDepartment(emp.department);
    setFormLeaveBalance(emp.leaveBalance);
    setShowModal(true);
  };

  const handleDeleteClick = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete employee "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/api/admin/employees/${id}`);
      setToast({ message: `Employee "${name}" deleted.`, type: 'success' });
      // Go to previous page if deleted last element on current page
      if (employees.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        fetchEmployees();
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to delete employee';
      setToast({ message: msg, type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modalMode === 'add' && !formPassword) {
      setToast({ message: 'Password is required for new employees', type: 'error' });
      return;
    }

    try {
      const payload = {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        department: formDepartment.trim(),
        leaveBalance: parseInt(formLeaveBalance) || 0,
      };

      if (formPassword.trim()) {
        payload.password = formPassword.trim();
      }

      if (modalMode === 'add') {
        await api.post('/api/admin/employees', payload);
        setToast({ message: 'New employee created successfully!', type: 'success' });
      } else {
        await api.put(`/api/admin/employees/${selectedId}`, payload);
        setToast({ message: 'Employee profile updated successfully!', type: 'success' });
      }

      setShowModal(false);
      fetchEmployees();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to save employee details';
      setToast({ message: msg, type: 'error' });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Manage Employees</h2>
          <p className="text-muted mb-0">Total registered employees: {totalElements}</p>
        </div>
        <button
          onClick={handleAddClick}
          className="btn btn-primary-custom d-flex align-items-center gap-2"
        >
          <FaUserPlus />
          <span>Add Employee</span>
        </button>
      </div>

      {toast && (
        <div className="toast-container-custom">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card-custom mb-4 py-3">
        <div className="row align-items-center">
          <div className="col-md-6 col-lg-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Search by name or email..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table Container */}
      <div className="table-custom-container">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaList size={40} className="mb-2 opacity-50 text-secondary" />
            <p className="mb-0">No employees found matching the criteria.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover table-custom mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Leave Balance</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="fw-semibold text-dark">{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.department}</td>
                      <td>
                        <span className={`badge px-2.5 py-1.5 rounded-pill text-uppercase ${emp.role === 'ADMIN' ? 'bg-indigo-subtle text-indigo' : 'bg-secondary-subtle text-secondary'}`} style={emp.role === 'ADMIN' ? { color: '#6366f1', backgroundColor: '#e0e7ff' } : {}}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="fw-bold text-success">{emp.role === 'ADMIN' ? '-' : `${emp.leaveBalance} Days`}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => handleEditClick(emp)}
                            className="btn btn-sm btn-outline-primary"
                            style={{ borderRadius: '6px' }}
                            title="Edit Profile"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(emp.id, emp.name)}
                            className="btn btn-sm btn-outline-danger"
                            style={{ borderRadius: '6px' }}
                            title="Delete"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <span className="small text-muted">
                  Showing Page {page + 1} of {totalPages}
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary px-3"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary px-3"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {modalMode === 'add' ? 'Add New Employee' : 'Edit Employee Details'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body py-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaUser size={14} className="text-muted" /></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="John Smith"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaEnvelope size={14} className="text-muted" /></span>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="john.smith@company.com"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">
                        Password {modalMode === 'edit' && <span className="text-muted small fw-normal">(Leave blank to keep unchanged)</span>}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaKey size={14} className="text-muted" /></span>
                        <input
                          type="password"
                          className="form-control"
                          placeholder={modalMode === 'add' ? 'Enter credentials password' : '••••••••'}
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          required={modalMode === 'add'}
                        />
                      </div>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Department</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaBuilding size={14} className="text-muted" /></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Engineering"
                          value={formDepartment}
                          onChange={(e) => setFormDepartment(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">System Role</label>
                      <select
                        className="form-select"
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                      >
                        <option value="EMPLOYEE">EMPLOYEE</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>

                    {formRole === 'EMPLOYEE' && (
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-secondary">Allowed Leave Balance</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formLeaveBalance}
                          onChange={(e) => setFormLeaveBalance(e.target.value)}
                          min="0"
                          max="365"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer border-top bg-light py-2" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary px-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary-custom px-4">
                    Save Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;
