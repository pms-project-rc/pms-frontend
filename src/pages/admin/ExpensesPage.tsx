import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Filter, DollarSign, User, Trash2, Loader } from 'lucide-react';
import { expenseService, Expense, CreateExpenseRequest } from '@/services/expenseService';

const ExpensesPage: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const [formData, setFormData] = useState<CreateExpenseRequest>({
        expense_type: 'INSUMOS',
        amount: 0,
        description: '',
        expense_date: new Date().toISOString().split('T')[0]
    });

    const categories = [
        { id: 'all', name: 'Todas', color: 'bg-gray-500' },
        { id: 'INSUMOS', name: 'Insumos', color: 'bg-blue-500' },
        { id: 'SERVICIOS', name: 'Servicios', color: 'bg-green-500' },
        { id: 'NOMINA', name: 'Nómina', color: 'bg-purple-500' },
        { id: 'VARIOS', name: 'Varios', color: 'bg-orange-500' },
        { id: 'Test', name: 'Test', color: 'bg-gray-400' } // Added to handle the 'Test' category mentioned by user
    ];

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await expenseService.getExpenses();
            setExpenses(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching expenses:', err);
            setError('Error al cargar los gastos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este gasto?')) {
            try {
                await expenseService.deleteExpense(id);
                alert('Gasto eliminado exitosamente');
                fetchExpenses();
            } catch (err) {
                console.error('Error deleting expense:', err);
                alert('Error al eliminar el gasto.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await expenseService.createExpense(formData);
            alert('Gasto registrado exitosamente');
            setShowModal(false);
            setFormData({
                expense_type: 'INSUMOS',
                amount: 0,
                description: '',
                expense_date: new Date().toISOString().split('T')[0]
            });
            fetchExpenses();
        } catch (err) {
            console.error('Error creating expense:', err);
            alert('Error al registrar el gasto.');
        }
    };

    const filteredExpenses = selectedCategory === 'all'
        ? expenses
        : expenses.filter(exp => exp.expense_type.toUpperCase() === selectedCategory.toUpperCase());

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const getCategoryColor = (type: string) => {
        const category = categories.find(c => c.id === type);
        return category ? category.color.replace('bg-', 'text-').replace('500', '800') : 'text-gray-800';
    };

    const getCategoryBg = (type: string) => {
        const category = categories.find(c => c.id === type);
        return category ? category.color.replace('bg-', 'bg-').replace('500', '100') : 'bg-gray-100';
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Gastos</h1>
                    <p className="text-gray-600">Registro y control de gastos operativos</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Registrar Gasto
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        <h3 className="text-sm font-medium text-gray-600">Total Gastos</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
                </div>
                {categories.filter(c => c.id !== 'all').map((cat) => {
                    const catExpenses = expenses.filter(e => e.expense_type === cat.id);
                    const catTotal = catExpenses.reduce((sum, e) => sum + e.amount, 0);
                    return (
                        <div key={cat.id} className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-4 h-4 rounded-full ${cat.color}`}></div>
                                <h3 className="text-sm font-medium text-gray-600">{cat.name}</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">${catTotal.toLocaleString()}</p>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === cat.id
                                ? 'bg-yellow-400 text-gray-900'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-yellow-500" />
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-center py-12">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Fecha</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Categoría</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Descripción</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Monto</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Registrado Por</th>
                                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {new Date(expense.expense_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryBg(expense.expense_type)} ${getCategoryColor(expense.expense_type)}`}>
                                                {categories.find(c => c.id === expense.expense_type)?.name || expense.expense_type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {expense.description || '-'}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="font-semibold text-gray-900">${expense.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">Admin #{expense.created_by}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredExpenses.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">
                                            No se encontraron gastos registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrar Nuevo Gasto</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <select
                                        value={formData.expense_type}
                                        onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    >
                                        <option value="INSUMOS">Insumos</option>
                                        <option value="SERVICIOS">Servicios</option>
                                        <option value="NOMINA">Nómina</option>
                                        <option value="VARIOS">Varios</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        rows={3}
                                        placeholder="Detalles del gasto..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
                                >
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesPage;
