import { SimpleGoalsList } from '@/components/goals/simple-goals-list';
import { Toaster } from 'react-hot-toast';

export default function GoalsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SimpleGoalsList />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        }}
      />
    </div>
  );
}