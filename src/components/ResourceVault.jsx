import { useState } from 'react'

const initialFormState = {
  title: '',
  link: '',
  notes: '',
}

function ResourceVault({
  resources,
  isLoading,
  error,
  aiSuggestions,
  isSuggestionsLoading,
  suggestionsError,
  suggestionTopic,
  onAddResource,
  onEditResource,
  onDeleteResource,
  onRequestSuggestions,
}) {
  const [formState, setFormState] = useState(initialFormState)
  const [editingResourceId, setEditingResourceId] = useState(null)
  const [topicInput, setTopicInput] = useState(suggestionTopic)

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormState((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formState.title.trim() || !formState.link.trim()) {
      return
    }

    const payload = {
      title: formState.title.trim(),
      link: formState.link.trim(),
      notes: formState.notes.trim(),
    }

    let success = false

    if (editingResourceId) {
      success = await onEditResource(editingResourceId, payload)
      if (success) {
        setEditingResourceId(null)
      }
    } else {
      success = await onAddResource(payload)
    }

    if (success) {
      setFormState(initialFormState)
    }
  }
  const handleDelete = async (resourceId) => {
    await onDeleteResource(resourceId)
  }

  const handleSuggestionSubmit = async (event) => {
    event.preventDefault()
    await onRequestSuggestions(topicInput)
  }


  const handleEditStart = (resource) => {
    setEditingResourceId(resource.id)
    setFormState({
      title: resource.title,
      link: resource.link,
      notes: resource.notes,
    })
  }

  const handleCancelEdit = () => {
    setEditingResourceId(null)
    setFormState(initialFormState)
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Resource Smart Vault</h2>
      <p className="mt-1 text-sm text-slate-600">
        Save, edit, and manage your learning resources in one place.
      </p>

      <form
        onSubmit={handleSuggestionSubmit}
        className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4"
      >
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="topicInput">
          Topic for AI Suggestions
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="topicInput"
            value={topicInput}
            onChange={(event) => setTopicInput(event.target.value)}
            placeholder="e.g., React Router"
            className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Get Suggestions
          </button>
        </div>
        <p className="mt-2 text-xs text-blue-900">
          AI suggests YouTube and documentation links for your selected topic.
        </p>
      </form>

      {isSuggestionsLoading ? (
        <p className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Loading AI suggestions...
        </p>
      ) : null}

      {suggestionsError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {suggestionsError}
        </p>
      ) : null}

      {(aiSuggestions.youtube.length > 0 || aiSuggestions.docs.length > 0) && !isSuggestionsLoading ? (
        <div className="mt-4 rounded-md border border-blue-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            AI Suggested Resources{suggestionTopic ? ` for ${suggestionTopic}` : ''}
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">YouTube</p>
              <ul className="mt-2 space-y-2">
                {aiSuggestions.youtube.map((item) => (
                  <li key={item.link} className="rounded border border-slate-200 bg-slate-50 p-2">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-slate-700"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Docs</p>
              <ul className="mt-2 space-y-2">
                {aiSuggestions.docs.map((item) => (
                  <li key={item.link} className="rounded border border-slate-200 bg-slate-50 p-2">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-slate-700"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-4 space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={formState.title}
            onChange={handleInputChange}
            placeholder="Resource title"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="link">
            Link
          </label>
          <input
            id="link"
            name="link"
            value={formState.link}
            onChange={handleInputChange}
            placeholder="https://example.com"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            value={formState.notes}
            onChange={handleInputChange}
            placeholder="Quick notes about this resource"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            {editingResourceId ? 'Update Resource' : 'Add Resource'}
          </button>
          {editingResourceId ? (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {isLoading ? (
        <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Loading resources...
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {resources.length === 0 && !isLoading ? (
        <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          No resources yet. Add your first learning resource above.
        </p>
      ) : null}

      <ul className="mt-4 space-y-3">
        {resources.map((resource) => (
          <li
            key={resource.id}
            className="rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <a
              href={resource.link}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-slate-700"
            >
              {resource.title}
            </a>
            <p className="mt-2 text-sm text-slate-600">{resource.notes}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleEditStart(resource)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(resource.id)}
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ResourceVault
