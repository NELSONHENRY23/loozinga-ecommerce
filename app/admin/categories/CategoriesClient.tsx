'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

import { createCategory, updateCategory, deleteCategory } from './actions';

type Category = {
  id: number;
  name: string;
  status: 'Active' | 'Inactive';
};

type CategoryClientProps = {
  categoryList: Category[];
};

export default function CategoriesClient({
  categoryList,
}: CategoryClientProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  const [categoryStatus, setCategoryStatus] = useState<'Active' | 'Inactive'>(
    'Active',
  );

  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const [error, setError] = useState('');

  // Open modal for Adding
  const openAddModal = () => {
    setEditCategory(null);
    setCategoryName('');
    setCategoryStatus('Active');
    setError('');
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const openEditModal = (category: Category) => {
    setEditCategory(category);
    setCategoryName(category.name);
    setCategoryStatus(category.status);
    setError('');
    setIsModalOpen(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    setEditCategory(null);
    setCategoryName('');
    setCategoryStatus('Active');
    setError('');
  };

  // Add or update category
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setError('Category name is required');
      return;
    }

    setError('');

    startTransition(async () => {
      const result = editCategory
        ? await updateCategory(editCategory.id, {
            name: trimmedName,
            status: categoryStatus,
          })
        : await createCategory({
            name: trimmedName,
            status: categoryStatus,
          });

      if (!result.success) {
        setError(result.message);
        return;
      }

      closeModal();

      router.refresh();
    });
  };

  // Delete Category
  const handleDelete = (categoryId: number) => {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this category?',
    );

    if (!shouldDelete) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategory(categoryId);

      if (!result.success) {
        alert(result.message);
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="p-5">
      {/* Heading */}
      <div className="mb-6 flex flex-wrap items-start gap-4 justify-between">
        <div>
          <h1 className="text-gray-700 text-2xl font-semibold">Categories</h1>

          <div className="mt-2 gap-2 flex text-gray-500 text-sm">
            <Link href="/admin" className="hover:text-blue-500">
              Home
            </Link>

            <span>/</span>
            <span>Categories</span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 text-sm bg-blue-500 px-4 py-2.5 font-medium text-white transition hover:bg-blue-600"
        >
          <Plus size={17} />
          Add Category
        </button>
      </div>

      {/* Categories panel */}

      <section className="overflow-hidden bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-700">Category List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {categoryList.length > 0 ? (
                categoryList.map((category) => (
                  <tr key={category.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-500">#{category.id}</td>

                    <td className="px-5 py-4 font-medium text-gray-700">
                      {category.name}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium
                                                ${
                                                  category.status === 'Active'
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'bg-gray-100 text-gray-500'
                                                }
                                                `}
                      >
                        {category.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(category)}
                          className="rounded-md p-2 text-blue-500 transition hover:bg-blue-50"
                          title="Edit category"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          className="rounded-md p-2 text-red-500 transiton hover:bg-red-50"
                          title="Delete category"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        // Modal goes here
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white shadow-xl"
          >
            {/* Modal Heading */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-700">
                {editCategory ? 'Edit Category' : 'Add Category'}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="text-gray-400 transition hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div>
                <label
                  htmlFor="categoryName"
                  className="mb-2 block text-sm font-medium text-gray-600"
                >
                  Category Name
                </label>

                <input
                  id="categoryName"
                  type="text"
                  onChange={(e) => setCategoryName(e.target.value)}
                  value={categoryName}
                  placeholder="Enter category name"
                  required
                  autoFocus
                  className="w-full border border-gray-200 p-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400"
                />
                
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    
              </div>

              <div>
                <label
                  htmlFor="categoryStatus"
                  className="mb-2 block text-gray-600 text-sm font-medium"
                >
                  Status
                </label>

                <select
                  id="categoryStatus"
                  value={categoryStatus}
                  onChange={(e) =>
                    setCategoryStatus(e.target.value as 'Active' | 'Inactive')
                  }
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-blue-500 px-4 py-2 text-sm text-white font-medium transition hover:bg-blue-600"
                >
                  {isPending
                    ? 'Saving...'
                    : editCategory
                      ? 'Save Changes'
                      : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
</div>
  );
}
