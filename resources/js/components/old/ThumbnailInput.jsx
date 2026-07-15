
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react'
import { useState } from 'react';

function ThumbnailInput({ name,thumbnail=null, setData, errors,placeholder }) {
    const [photo, setPhoto] = useState(thumbnail && window.location.origin + '/storage/' +  thumbnail);

    function thumbnailChangeHandaller(e) {
        setData(name, e.target.files[0]);
        setPhoto(URL.createObjectURL(e.target.files[0]));
    }

    function removeButton() {
        setData(name, '');
        setPhoto('');
    }

    return <>
        {
            photo ?
                <div className="relative">
                    <img src={photo} alt="" className="w-full h-auto rounded-md border p-2" />
                    <button className="absolute top-0 right-0 p-2 hover:bg-red-300" onClick={removeButton}>
                        <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                </div> :
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 dark:border-gray-700 px-6 py-10">
                    <div className="text-center">
                        <PhotoIcon aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                        <div className="mt-4 text-sm leading-6 text-gray-600">
                            <label
                                htmlFor={name}
                                className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                                <span>{placeholder ?? "Upload Photo"}</span>
                                <input id={name} name={name} type="file" onChange={(e) => thumbnailChangeHandaller(e)} className="sr-only" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>

        }
    </>
}

export default ThumbnailInput
