import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const ComingSoonPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="max-w-md">
        <CardHeader>
          <h1 className="text-4xl font-bold">Coming Soon</h1>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-8">
            We're working hard to bring you something amazing. Stay tuned for updates!
          </p>
          <Link href="/notes">
            <Button variant="outline" className="w-full">
              Back to Notes
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonPage;