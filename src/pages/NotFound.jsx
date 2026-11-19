import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, AlertCircle } from 'lucide-react';
import IconRenderer from '../components/ui/IconRenderer';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Not Found - Competition Starter';
  }, []);

  return (
    <section className="page">
      <div
        className="card"
        style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}
      >
        <div className="not-found-icon">
          <IconRenderer icon={AlertCircle} size={48} />
        </div>
        <h1>404</h1>
        <p>Page not found.</p>
        <p>The page you are looking for does not exist.</p>
        <div className="cta">
          <Link to="/" className="btn btn-primary">
            <IconRenderer icon={Compass} size={18} /> Go Home
          </Link>
        </div>
      </div>
    </section>
  );
}
