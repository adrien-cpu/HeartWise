import { ReactNode } from 'react';

interface TilesLayoutProps {
  children: ReactNode;
  title: string;
}

const TilesLayout = ({ children, title }: TilesLayoutProps) => {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {children}
      </div>
    </div>
  );
};

export default TilesLayout;
