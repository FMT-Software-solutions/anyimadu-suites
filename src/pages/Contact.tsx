import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { CountrySelector } from '../components/CountrySelector';
import { useSEO } from '@/lib/seo';

export default function Contact() {
  useSEO({
    title: 'Contact Anyimadu Suites — We’re here to help',
    description: 'Get in touch with Anyimadu Suites for reservations, directions, and inquiries. Available 24/7.',
    keywords: ['contact', 'Anyimadu Suites', 'directions', 'phone', 'email'],
    image: 'https://res.cloudinary.com/dkolqpqf2/image/upload/v1764083597/Screenshot_2025-11-25_151158_mrhzxy.png',
    type: 'website',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', country: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Location',
      content: 'Ghana',
      subContent: 'West Africa',
    },
    {
      icon: Phone,
      title: 'Phone',
      content: '+233 XX XXX XXXX',
      subContent: 'Available 24/7',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@anyimadusuites.com',
      subContent: 'We reply within 24 hours',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Open 24/7',
      subContent: 'Reception available anytime',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      <section className="relative py-20 bg-linear-to-br from-primary/10 to-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <Card className="shadow-xl border-none">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                  {submitted ? (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-gray-600">
                        Thank you for contacting us. We'll get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="john@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+233 XX XXX XXXX"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <CountrySelector
                          value={formData.country}
                          onValueChange={(value) =>
                            setFormData({ ...formData, country: value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          required
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          placeholder="Tell us how we can help you..."
                          rows={5}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
                      >
                        Send Message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  className="shadow-lg border-none hover:shadow-xl transition-shadow duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <info.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {info.title}
                        </h3>
                        <p className="text-gray-900 font-medium">
                          {info.content}
                        </p>
                        <p className="text-sm text-gray-600">
                          {info.subContent}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="shadow-xl border-none bg-linear-to-br from-primary/85 to-primary text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">
                    Ready to Book Your Stay?
                  </h3>
                  <p className="mb-6">
                    Experience luxury and comfort at Anyimadu Suites. Book your
                    exclusive suite today.
                  </p>
                  <Button
                    className="w-full bg-white text-primary hover:bg-gray-100"
                    onClick={() => {
                      const event = new CustomEvent('openBookingModal');
                      window.dispatchEvent(event);
                    }}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Find Us on the Map
            </h2>
            <div className="rounded-2xl overflow-hidden shadow-2xl h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Map Preview</p>
                <Button
                  variant="outline"
                  className="mt-4 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() =>
                    window.open('https://maps.google.com', '_blank')
                  }
                >
                  Open in Google Maps
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
