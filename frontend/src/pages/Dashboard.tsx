import { useState, useEffect, useRef } from "react";
import axios from "../api/api";
import { isAxiosError, AxiosError } from "axios";
import AuthGuard from "@/components/AuthGuard";

interface Investor {
    id: string;
    name: string;
    company: string;
    domains: { id: string; name: string }[];
    regions: { id: string; name: string }[];
    investment_stage: string;
    tags: string;
    website: string;
    contact_email: string;
  }
  
  interface ApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Investor[];
  }
  
  interface Filters {
    domain: string;
    region: string;
    stage: string;
    search: string;
  }

  interface SubscriptionStatus {
    isActive: boolean;
    expiryDate: string | null;
    freeUsesLeft: number;
  }

export default function Dashboard() {
    const [apiData, setApiData] = useState<ApiResponse>({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });
      const [filters, setFilters] = useState<Filters>({
        domain: "",
        region: "",
        stage: "",
        search: "",
      });
      const [usageCount, setUsageCount] = useState<number>(3);
      const [nextPage, setNextPage] = useState<string | null>(null);
      const [prevPage, setPrevPage] = useState<string | null>(null);
    
      useEffect(() => {
        fetchInvestors();
        setNextPage(null); // Reset pagination when filters change
      }, [filters]);
    
      const fetchInvestors = async (url?: string) => {
        try {
          const cleanfilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value.trim() !== '')
          );
          const endpoint = url || `/investors/?${new URLSearchParams({...cleanfilters}).toString()}`;
          const res = await axios.get<ApiResponse>(endpoint);
          console.log("RES:",res)
          setApiData(res.data);
          console.log(res.data)
          setNextPage(res.data.next);
          setPrevPage(res.data.previous);
          
          // Update usage count (implement actual API call here)
          setUsageCount(prev => prev > 0 ? prev - 1 : 0);
        } catch (error) {
          if(isAxiosError(error)) {
            if(error.response?.status === 403) {
              setApiData({ count: 0, next: null, previous: null, results: [] });
              alert("Subscription Expired! Please Subscribe to Continue.")
            }
          }
          console.error("Error fetching investors", error);
        }
      };

      const InvestorCard = ({ investor }: { investor: Investor }) => (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-transform duration-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{investor.name}</h3>
              <p className="text-sm text-gray-500">{investor.company}</p>
            </div>
            <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
              {investor.investment_stage}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {investor.domains.map((domain) => (
              <span 
                key={domain.id}
                className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800"
              >
                {domain.name}
              </span>
            ))}
            {investor.regions.map((region) => (
              <span 
                key={region.id}
                className="px-2 py-1 text-sm rounded-full bg-purple-100 text-purple-800"
              >
                {region.name}
              </span>
            ))}
          </div>
          
          <div className="text-sm space-y-2">
            <p className="text-gray-600">{investor.tags.split(",").join(" • ")}</p>
            <a href={`mailto:${investor.contact_email}`} className="text-blue-600 hover:underline block">
              {investor.contact_email}
            </a>
            <a href={investor.website} target="_blank" rel="noopener noreferrer" 
               className="text-blue-600 hover:underline block">
              Visit Website
            </a>
          </div>
        </div>
      );

      const PaginationControls = () => (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => prevPage && fetchInvestors(prevPage)}
            disabled={!prevPage}
            className={`px-4 py-2 rounded-md ${
              prevPage ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-400"
            }`}
          >
            Previous
          </button>
          
          <span className="text-gray-600">
            Showing {apiData.results.length} of {apiData.count} investors
          </span>
    
          <button
            onClick={() => nextPage && fetchInvestors(nextPage)}
            disabled={!nextPage}
            className={`px-4 py-2 rounded-md ${
              nextPage ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-400"
            }`}
          >
            Next
          </button>
        </div>
      );
    

  const FilterSidebar = () => (
    <div className="w-64 bg-white p-4 border-r border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Filters</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
          <select
            className="w-full p-2 border rounded-md"
            value={filters.domain}
            onChange={(e) => setFilters({...filters, domain: e.target.value})}
          >
            <option value="">All Domains</option>
            <option value="Tech">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
          <select
            className="w-full p-2 border rounded-md"
            value={filters.region}
            onChange={(e) => setFilters({...filters, region: e.target.value})}
          >
            <option value="">All Regions</option>
            <option value="US">United States</option>
            <option value="EU">European Union</option>
            <option value="Asia">Asia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Investment Stage</label>
          <select
            className="w-full p-2 border rounded-md"
            value={filters.stage}
            onChange={(e) => setFilters({...filters, stage: e.target.value})}
          >
            <option value="">All Stages</option>
            <option value="SEED">Seed</option>
            <option value="PRE_SEED">Pre-Seed</option>
            <option value="SERIES_A">Series A</option>
            <option value="SERIES_B_PLUS">Series B+</option>
          </select>
        </div>
      </div>

      <>
        <UsageStatusWidget/>
      </>
    </div>
  );

  const SearchHeader = () => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
  
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setFilters(prev => ({
          ...prev,
          search: value.trim()
        }));
      }, 1500);
    };
  
    // Clear timeout on component unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);
  
    return (
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search investors by name, company, or tags..."
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue={filters.search}
          onChange={handleSearchChange}
        />
      </div>
    );
  };

  const UsageStatusWidget = () => {
    const [subscription, setSubscription] = useState<SubscriptionStatus>({
      isActive: false,
      expiryDate: null,
      freeUsesLeft: 3,
    });
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);
  
    useEffect(() => {
      // Fetch subscription status from API
      const fetchSubscriptionStatus = async () => {
        try {
          const response = await axios.get('/subscription/status/', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          });
          const data = response.data;
          console.log(data)
          setSubscription({
            isActive: data.subscription_active,
            expiryDate: data.subscription_expiry,
            freeUsesLeft: data.free_uses_left
          });
          
          if (data.is_active && data.expiry_date) {
            calculateTimeLeft(data.expiry_date);
          }
        } catch (error) {
          console.error('Error fetching subscription status:', error);
        }
      };
  
      fetchSubscriptionStatus();
    }, []);
  
    const calculateTimeLeft = (expiryDate: string) => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const difference = expiry - now;
  
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        setProgress(Math.round((1 - difference / (30 * 24 * 60 * 60 * 1000)) * 100));
      }
    };
  
    console.log(subscription)
    return (
      <div className="mt-8 p-4 bg-blue-50 rounded-lg space-y-3">
        <h3 className="text-sm font-medium text-blue-800">Usage Status</h3>
        {subscription.isActive ? (
          <div className="space-y-2">
            <div className="flex flex-col justify-between items-center text-sm gap-4">
              <span className="text-blue-700">Subscription Active</span>
              {subscription.expiryDate && (
                <span className="text-blue-600">
                  Expires: {new Date(subscription.expiryDate).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {timeLeft && (
              <div className="space-y-1">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-blue-700">
              Free uses remaining: {subscription.freeUsesLeft}
            </p>
            <button className="w-full text-sm bg-blue-600 text-white py-2 px-4 rounded-md 
                            hover:bg-blue-700 transition-colors">
              Upgrade to Pro
            </button>
            <p className="text-xs text-blue-600">
              {subscription.freeUsesLeft === 0 && 
                "You've used all free searches. Subscribe to continue"}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
<AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <FilterSidebar />
        <div className="flex-1 p-8">
          <SearchHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apiData.results.length > 0 ? (
              apiData.results.map((investor) => (
                <InvestorCard key={investor.id} investor={investor} />
              ))
            ) : (
              <div className="text-gray-500 text-center col-span-full py-12">
                No investors found matching your criteria
              </div>
            )}
          </div>
          <PaginationControls />
        </div>
      </div>
    </AuthGuard>
  );
}