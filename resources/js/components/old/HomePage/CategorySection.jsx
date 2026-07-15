import React, { useState } from 'react'


const CategorySection = () => {
    const CATEGORIES = [
        'Nature', 'Technology', 'People', 'City', 'Animals', 'Food', 'Sports', 'Travel', 'Abstract', 'Business',
    ];
      const [activeCategory, setActiveCategory] = useState('All');

    return (
        <div className="mx-auto max-w-7xl px-6 pt-6">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Categories:</span>
                <button
                    className={`rounded-full px-3 py-1 text-sm ${activeCategory === 'All' ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300'
                        }`}
                    onClick={() => setActiveCategory('All')}
                >
                    All
                </button>
                {CATEGORIES.map((c) => (
                    <button
                        key={c}
                        className={`rounded-full px-3 py-1 text-sm ${activeCategory === c ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300'
                            }`}
                        onClick={() => setActiveCategory(c)}
                    >
                        {c}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default CategorySection