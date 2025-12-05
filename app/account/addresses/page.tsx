'use client';

import { useState } from 'react';
import { FiMapPin, FiEdit, FiTrash2 } from 'react-icons/fi';

const mockAddresses = [
  {
    id: '1',
    street: 'ул. Ленина, д. 10, кв. 25',
    city: 'Москва',
    postalCode: '101000',
    isDefault: true,
  },
  {
    id: '2',
    street: 'пр. Мира, д. 5',
    city: 'Санкт-Петербург',
    postalCode: '190000',
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    postalCode: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Edit existing address
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingId
            ? { ...addr, ...formData }
            : addr
        )
      );
      setEditingId(null);
    } else {
      // Add new address
      const newAddress = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
    }
    setFormData({ street: '', city: '', postalCode: '' });
    setIsAdding(false);
  };

  const handleEdit = (address: typeof mockAddresses[0]) => {
    setFormData({
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
    });
    setEditingId(address.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setFormData({ street: '', city: '', postalCode: '' });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот адрес?')) {
      setAddresses(addresses.filter((addr) => addr.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Адреса доставки</h1>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn-primary">
            Добавить адрес
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {editingId ? 'Редактировать адрес' : 'Новый адрес'}
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              Отмена
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Город</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Улица и дом</label>
            <input
              type="text"
              required
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Индекс</label>
            <input
              type="text"
              required
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary">
            Сохранить адрес
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div key={address.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-primary-600" />
                {address.isDefault && (
                  <span className="bg-primary-100 text-primary-600 px-2 py-1 rounded text-sm font-medium">
                    По умолчанию
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(address)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Редактировать адрес"
                >
                  <FiEdit />
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="p-2 hover:bg-gray-100 rounded text-sm text-gray-600"
                    title="Сделать адресом по умолчанию"
                  >
                    По умолчанию
                  </button>
                )}
                <button
                  onClick={() => handleDelete(address.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded"
                  title="Удалить адрес"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <p className="font-semibold mb-1">{address.city}</p>
            <p className="text-gray-600 mb-1">{address.street}</p>
            <p className="text-gray-600">Индекс: {address.postalCode}</p>
          </div>
        ))}
      </div>
    </>
  );
}

