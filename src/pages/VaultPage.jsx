import ResourceVault from '../components/ResourceVault'
import { useResourceVault } from '../hooks/useResourceVault'

function VaultPage() {
  const {
    resources,
    isLoading,
    error,
    aiSuggestions,
    isSuggestionsLoading,
    suggestionsError,
    suggestionTopic,
    createResource,
    updateResource,
    deleteResource,
    requestSuggestions,
  } = useResourceVault()

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Vault</h1>
      <p className="mt-2 text-slate-600">
        Manage your saved resources and discover AI suggestions by topic.
      </p>

      <ResourceVault
        resources={resources}
        isLoading={isLoading}
        error={error}
        aiSuggestions={aiSuggestions}
        isSuggestionsLoading={isSuggestionsLoading}
        suggestionsError={suggestionsError}
        suggestionTopic={suggestionTopic}
        onAddResource={createResource}
        onEditResource={updateResource}
        onDeleteResource={deleteResource}
        onRequestSuggestions={requestSuggestions}
      />
    </section>
  )
}

export default VaultPage