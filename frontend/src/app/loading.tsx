import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="container-afc flex min-h-[50vh] items-center justify-center">
      <Spinner size={36} className="text-gold" />
    </div>
  );
}
