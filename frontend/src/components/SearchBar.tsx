interface SearchBarProps {
    filters: {
      search: string;
    };
    setFilters: React.Dispatch<React.SetStateAction<{
      search: string;
    }>>;
  }
  
  export default function SearchBar({ filters, setFilters }: SearchBarProps) {
    return (
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search investors..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
    );
  }
  