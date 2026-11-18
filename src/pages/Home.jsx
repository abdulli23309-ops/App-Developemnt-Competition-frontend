import { Link } from 'react-router-dom';
import { Compass, Activity, Layers, Code, Play } from 'lucide-react';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    document.title = 'Home - Competition Starter';
  }, []);

  return (
    <section className="page">
      <div className="card">
        <div className="badge">Ready for competition</div>
        <h1>Competition-Ready React Starter</h1>
        <p className="lead">
          A clean, lightweight frontend foundation prepared for rapid
          implementation once the competition problem statement is announced.
        </p>

        <div className="features-grid">
          <FeatureItem
            icon={Compass}
            title="Routing"
            description={
              <>
                React Router configured with a Home page and a Not Found
                page.
              </>
            }
          />
          <FeatureItem
            icon={Activity}
            title="API layer"
            description={
              <>
                Axios instance with centralized endpoint definitions and a
                configurable base URL.
              </>
            }
          />
          <FeatureItem
            icon={Layers}
            title="UI foundation"
            description={
              <>
                CSS variables, responsive layout, reusable layout components,
                and mobile-friendly navigation.
              </>
            }
          />
          <FeatureItem
            icon={Code}
            title="No assumptions"
            description={
              <>
                No domain logic, authentication, or mock backend. Ready for
                any competition problem.
              </>
            }
          />
        </div>

        <div className="cta">
          <p>Waiting for the problem statement...</p>
          <Link to="/" className="btn btn-primary">
            <Play size={18} /> Start Building
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ icon: Icon, title, description }) {
  return (
    <div className="feature-item">
      <div className="feature-icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
