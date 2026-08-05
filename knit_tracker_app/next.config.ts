/*
import {NextConfig} from 'next';

// Proxy setup
const nextConfig: NextConfig = {  
  async rewrites() {
    return [
     {
       source: '/api/:path*',
      // destination: `${process.env.NEXT_PUBLIC_DJANGO_API_ROUTE}/:path*`, // Django configuration
      destination: `${process.env.NEXT_PUBLIC_ASPNET_API_ROUTE}/:path*` // ASP.NET configuration
     },
    ];
  },
};

export default nextConfig;
*/