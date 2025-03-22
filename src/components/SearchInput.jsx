import React, { useState } from "react";
import { Search } from "lucide-react";

function SearchInput({ handleSubmit }) {
  const [searchQuery, setSearchQuery] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(searchQuery);
  };

  return (
    <form onSubmit={onSubmit} className="relative">
      <input
        value={searchQuery}
        placeholder="Search by name"
        onChange={(event) => setSearchQuery(event.target.value)}
        className="w-72 px-3 py-2 border rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-blue-500 hover:text-blue-700"
        aria-label="search by name"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}

export default SearchInput;
