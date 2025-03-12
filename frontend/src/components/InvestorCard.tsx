export interface InvestorProps {
    investor: {
      id: number;
      name: string;
      company: string;
      investment_stage: string;
    };
  }
  
  export default function InvestorCard({ investor }: InvestorProps) {
    return (
      <div className="p-4 border rounded-lg shadow-md">
        <h3 className="text-lg font-bold">{investor.name}</h3>
        <p>{investor.company}</p>
        <p className="text-sm text-gray-500">{investor.investment_stage}</p>
      </div>
    );
  }
  