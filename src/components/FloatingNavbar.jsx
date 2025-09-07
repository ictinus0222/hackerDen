import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from './ui/navigation-menu';
import { Badge } from './ui/badge';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const FloatingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Floating Navbar */}
      <nav className={cn(
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out",
        "max-w-4xl w-full mx-auto px-4",
        isScrolled 
          ? "bg-background/95 backdrop-blur-md border shadow-lg rounded-full py-2" 
          : "bg-card/10 backdrop-blur-md border-border/20 rounded-full py-3"
      )}>
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isScrolled ? "px-6" : "px-6"
        )}>
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className={cn(
              "font-bold text-lg transition-colors",
              isScrolled ? "text-foreground" : "text-foreground"
            )}>
              HackerDen
            </div>
            <Badge variant="secondary" className={cn(
              "text-xs",
              isScrolled ? "bg-primary/10 text-primary" : "bg-primary/20 text-primary border-primary/30"
            )}>
              Beta
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="space-x-1">
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      "cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isScrolled 
                        ? "text-muted-foreground hover:text-foreground hover:bg-accent" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                    onClick={() => scrollToSection('hero')}
                  >
                    Home
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      "cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isScrolled 
                        ? "text-muted-foreground hover:text-foreground hover:bg-accent" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                    onClick={() => scrollToSection('features')}
                  >
                    Features
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      "cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isScrolled 
                        ? "text-muted-foreground hover:text-foreground hover:bg-accent" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                    onClick={() => scrollToSection('testimonials')}
                  >
                    Testimonials
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      "cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isScrolled 
                        ? "text-muted-foreground hover:text-foreground hover:bg-accent" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                    onClick={() => scrollToSection('faq')}
                  >
                    FAQ
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* CTA Button & Mobile Menu Toggle */}
          <div className="flex items-center space-x-3">
            <Button 
              size="sm" 
              className={cn(
                "hidden sm:inline-flex font-medium",
                isScrolled 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              onClick={() => navigate('/login')}
            >
              Get Early Access
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "md:hidden p-2",
                isScrolled 
                  ? "text-foreground hover:bg-accent" 
                  : "text-foreground hover:bg-accent"
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-md border rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <button
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => scrollToSection('hero')}
              >
                Home
              </button>
              <button
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => scrollToSection('features')}
              >
                Features
              </button>
              <button
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => scrollToSection('testimonials')}
              >
                Testimonials
              </button>
              <button
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => scrollToSection('faq')}
              >
                FAQ
              </button>
              <div className="pt-4 border-t">
                <Button 
                  className="w-full font-medium" 
                  onClick={() => navigate('/login')}
                >
                  Get Early Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingNavbar;
