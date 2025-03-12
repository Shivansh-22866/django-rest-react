import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LightningBoltIcon, GlobeIcon, BarChartIcon } from '@radix-ui/react-icons';
import { useAuth } from '@/context/AuthContext';

const HomePage = () => {
  const {user} = useAuth()
  const features = [
    {
      icon: <LightningBoltIcon className="w-8 h-8 mb-4 text-blue-600" />,
      title: "Fast Investor Matching",
      description: "Find the perfect investors in seconds with our advanced search and filtering system."
    },
    {
      icon: <GlobeIcon className="w-8 h-8 mb-4 text-blue-600" />,
      title: "Global Reach",
      description: "Access investors from all over the world across multiple industries and stages."
    },
    {
      icon: <BarChartIcon className="w-8 h-8 mb-4 text-blue-600" />,
      title: "Data-Driven Insights",
      description: "Get detailed analytics and insights to make informed decisions."
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Connect with the Right Investors
            </h1>
            <p className="mt-6 text-xl text-gray-500">
              Your gateway to finding the perfect investment partners. 
              Smart, efficient, and tailored to your needs.
            </p>
            <>
            {!user && (
                <div className='mt-10 flex justify-center space-x-4'>
                                  <Button asChild className='bg-blue-700 text-white'>
                <Link to="/register" className="text-lg px-8 py-6">
                  Get Started
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login" className="text-lg px-8 py-6">
                  Sign In
                </Link>
              </Button>
                </div>
            )}
            </>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Us?</h2>
            <p className="mt-4 text-xl text-gray-500">
              The smart way to connect with investors
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-center text-2xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-gray-600">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to Transform Your Funding Journey?
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Join thousands of businesses finding their perfect investors
            </p>
            <div className="mt-10">
              <Button asChild>
                <Link to="/register" className="text-lg px-8 py-6">
                  Start Free Trial
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              3 free searches included
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} InvestorConnect. All rights reserved.</p>
            <div className="mt-4 space-x-4">
              <Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gray-900">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;