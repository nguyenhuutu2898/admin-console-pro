import React from 'react';
import { Skeleton } from './Skeleton';

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 5,
  columns = 4
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={`h-5 ${
                colIndex === 0 ? 'w-32' :
                colIndex === 1 ? 'w-48' :
                colIndex === 2 ? 'w-24' :
                'w-20'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
