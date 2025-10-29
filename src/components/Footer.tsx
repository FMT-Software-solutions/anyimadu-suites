import { callNumber, emailAddress } from '@/lib/constants';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-1">
              Anyimadu Suites
            </h3>
            <p className="text-sm mb-2">
              Your premium destination for relaxation and Natural Serenity
            </p>
            <p className="text-xs text-gray-400">
              Relaxation • Tourism • Hospitality
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/suites"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Suites
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Central Region, Ghana</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{callNumber}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{emailAddress}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Anyimadu Suites. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
