import React, { useState, useEffect } from 'react';
import { Handshake, Building2, Percent, Edit2, Trash2, Plus, Users, Loader, Car, X } from 'lucide-react';
import { agreementService, Agreement, CreateAgreementRequest, UpdateAgreementRequest } from '@/services/agreementService';

const AgreementsPage: React.FC = () => {
    const [agreements, setAgreements] = useState<Agreement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAgreementId, setSelectedAgreementId] = useState<number | null>(null);
    const [newVehiclePlate, setNewVehiclePlate] = useState('');
    const [newVehicleType, setNewVehicleType] = useState('Automovil');

    const [formData, setFormData] = useState<CreateAgreementRequest>({
        company_name: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        start_date: new Date().toISOString().split('T')[0],
        discount_percentage: 0,
        notes: ''
    });

    const fetchAgreements = async () => {
        setLoading(true);
        try {
            const data = await agreementService.getAgreements();
            setAgreements(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching agreements:', err);
            setError('Error al cargar los convenios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgreements();
    }, []);

    const handleEdit = (agreement: Agreement) => {
        setIsEditing(true);
        setSelectedAgreementId(agreement.id);
        setFormData({
            company_name: agreement.company_name,
            contact_name: agreement.contact_name,
            contact_phone: agreement.contact_phone || '',
            contact_email: agreement.contact_email || '',
            start_date: agreement.start_date,
            discount_percentage: agreement.discount_percentage,
            notes: agreement.notes || ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setSelectedAgreementId(null);
        setFormData({
            company_name: '',
            contact_name: '',
            contact_phone: '',
            contact_email: '',
            start_date: new Date().toISOString().split('T')[0],
            discount_percentage: 0,
            notes: ''
        });
        setNewVehiclePlate('');
        setNewVehicleType('Automovil');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && selectedAgreementId) {
                await agreementService.updateAgreement(selectedAgreementId, formData);
                alert('Convenio actualizado exitosamente');
            } else {
                await agreementService.createAgreement(formData);
                alert('Convenio creado exitosamente');
            }
            handleCloseModal();
            fetchAgreements();
        } catch (err) {
            console.error('Error saving agreement:', err);
            alert('Error al guardar el convenio.');
        }
    };

    const handleAddVehicle = async () => {
        if (!selectedAgreementId || !newVehiclePlate) return;
        try {
            await agreementService.addVehicle(selectedAgreementId, newVehiclePlate, newVehicleType);
            setNewVehiclePlate('');
            setNewVehicleType('Automovil');
            // Refresh agreements to show new vehicle count/list if we were showing it
            // Ideally we should update local state or refetch specific agreement
            fetchAgreements(); 
            alert('Vehículo agregado correctamente');
        } catch (err: any) {
            console.error('Error adding vehicle:', err);
            const errorMessage = err.response?.data?.detail || 'Error al agregar vehículo. Verifique que la placa exista.';
            alert(errorMessage);
        }
    };

    const handleRemoveVehicle = async (plate: string) => {
        if (!selectedAgreementId) return;
        if (!confirm(`¿Está seguro de eliminar el vehículo ${plate} del convenio?`)) return;
        
        try {
            await agreementService.removeVehicle(selectedAgreementId, plate);
            fetchAgreements();
            alert('Vehículo eliminado del convenio');
        } catch (err) {
            console.error('Error removing vehicle:', err);
            alert('Error al eliminar vehículo.');
        }
    };

    // Helper to find current agreement vehicles for the modal
    const currentAgreementVehicles = agreements.find(a => a.id === selectedAgreementId)?.vehicles || [];

    const stats = {
        total: agreements.length,
        active: agreements.filter(a => a.is_active === 'active').length,
        totalVehicles: agreements.reduce((sum, a) => sum + (a.vehicles ? a.vehicles.length : 0), 0)
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Convenios Empresariales</h1>
                    <p className="text-gray-600">Gestión de acuerdos comerciales con empresas</p>
                </div>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Convenio
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Handshake className="w-8 h-8 text-blue-600" />
                        <h3 className="text-sm font-medium text-gray-600">Total Convenios</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Handshake className="w-8 h-8 text-green-600" />
                        <h3 className="text-sm font-medium text-gray-600">Convenios Activos</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8 text-purple-600" />
                        <h3 className="text-sm font-medium text-gray-600">Vehículos Totales</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalVehicles}</p>
                </div>
            </div>

            {/* Agreements Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-yellow-500" />
                </div>
            ) : error ? (
                <div className="text-red-600 text-center py-12">{error}</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {agreements.map((agreement) => (
                        <div key={agreement.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Header */}
                            <div className={`p-6 ${agreement.is_active === 'active' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-400'}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{agreement.company_name}</h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${agreement.is_active === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {agreement.is_active === 'active' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEdit(agreement)}
                                            className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                            title="Editar Convenio"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {/* 
                                        <button className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        */}
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-4">
                                {/* Contact Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Contacto:</span>
                                        <span className="text-sm font-medium text-gray-900">{agreement.contact_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">📞</span>
                                        <span className="text-sm text-gray-900">{agreement.contact_phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">📧</span>
                                        <span className="text-sm text-gray-900">{agreement.contact_email}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4"></div>

                                {/* Discounts */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Percent className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-medium text-blue-800">Descuento General</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-600">{agreement.discount_percentage}%</p>
                                    </div>
                                    {/* 
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Percent className="w-4 h-4 text-green-600" />
                                            <span className="text-xs font-medium text-green-800">Descuento Lavado</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-600">{agreement.washing_discount}%</p>
                                    </div>
                                    */}
                                </div>

                                {/* Additional Info */}
                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        {/* Valid until not in current model, maybe add later */}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-600">Vehículos registrados:</span>
                                        <p className="text-sm font-semibold text-gray-900">{agreement.vehicles ? agreement.vehicles.length : 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && agreements.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <Handshake className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay convenios registrados</h3>
                    <p className="text-gray-600 mb-6">Comienza agregando un nuevo convenio empresarial</p>
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setShowModal(true);
                        }}
                        className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
                    >
                        Crear Primer Convenio
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isEditing ? 'Editar Convenio' : 'Nuevo Convenio Empresarial'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Form Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información General</h3>
                                <form id="agreementForm" onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                                        <input
                                            type="text"
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Contacto</label>
                                        <input
                                            type="text"
                                            value={formData.contact_name}
                                            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                            <input
                                                type="text"
                                                value={formData.contact_phone}
                                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={formData.contact_email}
                                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                                            <input
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                                            <input
                                                type="number"
                                                value={formData.discount_percentage}
                                                onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                            rows={3}
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Vehicles Section (Only in Edit Mode) */}
                            {isEditing && (
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehículos Asociados</h3>
                                    
                                    {/* Add Vehicle Form */}
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Placa (ej. ABC-123)"
                                            value={newVehiclePlate}
                                            onChange={(e) => setNewVehiclePlate(e.target.value.toUpperCase())}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        />
                                        <select
                                            value={newVehicleType}
                                            onChange={(e) => setNewVehicleType(e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        >
                                            <option value="Automovil">Automóvil</option>
                                            <option value="Motocicleta">Motocicleta</option>
                                            <option value="Camioneta">Camioneta</option>
                                            <option value="Camion">Camión</option>
                                            <option value="Bus">Bus</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAddVehicle}
                                            disabled={!newVehiclePlate}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Vehicles List */}
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                        {currentAgreementVehicles.length > 0 ? (
                                            currentAgreementVehicles.map((vehicle) => (
                                                <div key={vehicle.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <Car className="w-5 h-5 text-gray-500" />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{vehicle.plate}</p>
                                                            {vehicle.vehicle_type && (
                                                                <p className="text-xs text-gray-500">{vehicle.vehicle_type}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveVehicle(vehicle.plate)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Eliminar vehículo"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                No hay vehículos asociados a este convenio.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {!isEditing && (
                                <div className="flex items-center justify-center bg-gray-50 rounded-xl p-6 text-gray-500">
                                    <p>Guarde el convenio primero para agregar vehículos.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                form="agreementForm"
                                className="flex-1 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
                            >
                                {isEditing ? 'Guardar Cambios' : 'Crear Convenio'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgreementsPage;
