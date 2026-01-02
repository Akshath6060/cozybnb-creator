import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-muted border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:underline">Help Center</Link></li>
              <li><Link to="#" className="hover:underline">AirCover</Link></li>
              <li><Link to="#" className="hover:underline">Safety information</Link></li>
              <li><Link to="#" className="hover:underline">Cancellation options</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hosting</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:underline">Airbnb your home</Link></li>
              <li><Link to="#" className="hover:underline">AirCover for Hosts</Link></li>
              <li><Link to="#" className="hover:underline">Hosting resources</Link></li>
              <li><Link to="#" className="hover:underline">Community forum</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Airbnb</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:underline">Newsroom</Link></li>
              <li><Link to="#" className="hover:underline">New features</Link></li>
              <li><Link to="#" className="hover:underline">Careers</Link></li>
              <li><Link to="#" className="hover:underline">Investors</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:underline">About us</Link></li>
              <li><Link to="#" className="hover:underline">Trust & Safety</Link></li>
              <li><Link to="#" className="hover:underline">Accessibility</Link></li>
              <li><Link to="#" className="hover:underline">Gift cards</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Airbnb Clone. College Project.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="#" className="hover:underline">Privacy</Link>
            <Link to="#" className="hover:underline">Terms</Link>
            <Link to="#" className="hover:underline">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
