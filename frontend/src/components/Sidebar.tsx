import { useState, useEffect } from "react";
import axios from "../api/api";

interface SidebarProps {
  filters: {
    domain: string[];
    region: string[];
    stage: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    domain: string[];
    region: string[];
    stage: string;
  }>>;
}

export default function Sidebar({ filters, setFilters }: SidebarProps) {
  const [domains, setDomains] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const investmentStages = ["Pre-Seed", "Seed", "Series A", "Series B", "Growth"];

  useEffect(() => {
    // Fetch domains and regions from API
    axios.get("/domains/").then(res => setDomains(res.data.map((d: any) => d.name)));
    axios.get("/regions/").then(res => setRegions(res.data.map((r: any) => r.name)));
  }, []);

  const handleDomainChange = (domain: string) => {
    setFilters(prev => ({
      ...prev,
      domain: prev.domain.includes(domain) 
        ? prev.domain.filter(d => d !== domain) 
        : [...prev.domain, domain]
    }));
  };

  const handleRegionChange = (region: string) => {
    setFilters(prev => ({
      ...prev,
      region: prev.region.includes(region) 
        ? prev.region.filter(r => r !== region) 
        : [...prev.region, region]
    }));
  };

  const handleStageChange = (stage: string) => {
    setFilters(prev => ({
      ...prev,
      stage: prev.stage === stage ? "" : stage
    }));
  };

  return (
    <div className="w-64 p-4 bg-gray-100 h-screen">
      <h2 className="text-lg font-semibold mb-3">Filters</h2>

      {/* Domains Filter */}
      <div>
        <h3 className="text-sm font-medium">Domains</h3>
        {domains.map(domain => (
          <label key={domain} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.domain.includes(domain)}
              onChange={() => handleDomainChange(domain)}
            />
            <span>{domain}</span>
          </label>
        ))}
      </div>

      {/* Regions Filter */}
      <div className="mt-3">
        <h3 className="text-sm font-medium">Regions</h3>
        {regions.map(region => (
          <label key={region} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.region.includes(region)}
              onChange={() => handleRegionChange(region)}
            />
            <span>{region}</span>
          </label>
        ))}
      </div>

      {/* Investment Stage Filter */}
      <div className="mt-3">
        <h3 className="text-sm font-medium">Investment Stage</h3>
        {investmentStages.map(stage => (
          <label key={stage} className="flex items-center space-x-2">
            <input
              type="radio"
              name="investment_stage"
              checked={filters.stage === stage}
              onChange={() => handleStageChange(stage)}
            />
            <span>{stage}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
