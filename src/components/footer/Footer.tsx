import { useState, useEffect } from "react";
import AppLink from "@/lib/navigation/AppLink";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import NewsletterSubscribe from "./NewsletterSubscribe";

interface Contact {
  id: number;
  name: string | null;
  link: string | null;
}

interface Channel {
  id: number;
  name: string | null;
  link: string | null;
}

interface Group {
  id: number;
  name: string | null;
  link: string | null;
}

interface SocialPlatform {
  id: number;
  Name: string | null;
  Link: string | null;
}

interface Policy {
  id: number;
  PolicyName: string | null;
}

interface AboutEntry {
  id: number;
  AboutName: string | null;
}

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const policySlug = slugify;
const aboutSlug = slugify;

const cleanContactDisplay = (value: string): string => {
  return value
    .replace(/^mailto:/i, '')
    .replace(/^tel:\+?/i, '')
    .replace(/^\+/, '')
    .trim();
};

// Priority order for contact methods — lower number = higher priority
const contactPriority = (link: string | null): number => {
  const l = (link || '').toLowerCase();
  if (l.startsWith('tel:')) return 0;
  if (l.includes('wa.me') || l.includes('whatsapp')) return 1;
  if (l.startsWith('mailto:')) return 2;
  return 3;
};

const byName = <T extends { name?: string | null; Name?: string | null }>(a: T, b: T) =>
  ((a.name ?? a.Name) || '').localeCompare((b.name ?? b.Name) || '', undefined, {
    sensitivity: 'base',
  });

interface FooterData {
  contacts: Contact[];
  channels: Channel[];
  groups: Group[];
  socials: SocialPlatform[];
  policies: Policy[];
  abouts: AboutEntry[];
}

let footerCache: FooterData | null = null;
let footerPromise: Promise<FooterData> | null = null;

const fetchFooterData = (): Promise<FooterData> => {
  if (footerCache) return Promise.resolve(footerCache);
  if (footerPromise) return footerPromise;

  footerPromise = (async () => {
    const [contactsRes, channelsRes, groupsRes, socialsRes, policiesRes, aboutsRes] = await Promise.all([
      (supabase as any).from('Connects').select('*').order('id'),
      (supabase as any).from('Channels').select('*').order('id'),
      (supabase as any).from('Groups').select('*').order('id'),
      (supabase as any).from('Social Platforms').select('*').order('id'),
      (supabase as any).from('All-Policy').select('id, PolicyName').order('id'),
      (supabase as any).from('All-About').select('id, AboutName').order('id'),
    ]);
    const data: FooterData = {
      contacts: !contactsRes.error && contactsRes.data
        ? [...contactsRes.data].sort(
            (a: Contact, b: Contact) => contactPriority(a.link) - contactPriority(b.link),
          )
        : [],
      channels: !channelsRes.error && channelsRes.data ? [...channelsRes.data].sort(byName) : [],
      groups: !groupsRes.error && groupsRes.data ? [...groupsRes.data].sort(byName) : [],
      socials: !socialsRes.error && socialsRes.data ? [...socialsRes.data].sort(byName) : [],
      policies: !policiesRes.error && policiesRes.data
        ? ([...policiesRes.data].filter((p: Policy) => p.PolicyName) as Policy[])
        : [],
      abouts: !aboutsRes.error && aboutsRes.data
        ? ([...aboutsRes.data].filter((a: AboutEntry) => a.AboutName) as AboutEntry[])
        : [],
    };
    footerCache = data;
    return data;
  })();

  return footerPromise;
};

const Footer = () => {
  const { config: siteConfig } = useSiteConfig();
  const [contacts, setContacts] = useState<Contact[]>(footerCache?.contacts ?? []);
  const [channels, setChannels] = useState<Channel[]>(footerCache?.channels ?? []);
  const [groups, setGroups] = useState<Group[]>(footerCache?.groups ?? []);
  const [socials, setSocials] = useState<SocialPlatform[]>(footerCache?.socials ?? []);
  const [policies, setPolicies] = useState<Policy[]>(footerCache?.policies ?? []);
  const [abouts, setAbouts] = useState<AboutEntry[]>(footerCache?.abouts ?? []);

  useEffect(() => {
    fetchFooterData().then((data) => {
      setContacts(data.contacts);
      setChannels(data.channels);
      setGroups(data.groups);
      setSocials(data.socials);
      setPolicies(data.policies);
      setAbouts(data.abouts);
    });
  }, []);

  return (
    <footer className="w-full bg-background text-foreground pt-8 pb-2 px-6 border-t border-border mt-48">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          <div>
            {siteConfig?.logoFull && (
              <div className="mb-4 h-6">
                <img
                  src={siteConfig.logoFull}
                  alt={siteConfig?.name || ""}
                  className="h-6 w-auto"
                  width="120"
                  height="24"
                  loading="lazy"
                />
              </div>
            )}
            {siteConfig?.slong && (
              <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-md mb-6">
                {siteConfig.slong}
              </p>
            )}
            <NewsletterSubscribe />

            {contacts.length > 0 ? (
              <div className="space-y-2 text-sm font-light text-muted-foreground">
                <p className="font-normal text-foreground mb-1">Contact</p>
                {contacts.map((contact) => {
                  const displayName = contact.name 
                    ? cleanContactDisplay(contact.name) 
                    : contact.link 
                      ? cleanContactDisplay(contact.link) 
                      : '';
                  return (
                    <div key={contact.id}>
                      {contact.link ? (
                        <a href={contact.link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors cursor-pointer">
                          {displayName}
                        </a>
                      ) : (
                        <span>{displayName}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 text-sm font-light text-muted-foreground">
                <p className="font-normal text-foreground mb-1">Contact</p>
                <p>No contact info available</p>
              </div>
            )}
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {abouts.length > 0 && (
              <div>
                <h4 className="text-sm font-normal mb-4">About</h4>
                <ul className="space-y-2">
                  {abouts.map((a) => (
                    <li key={a.id}>
                      <AppLink
                        href={`/about/${aboutSlug(a.AboutName as string)}`}
                        className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {a.AboutName}
                      </AppLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h4 className="text-sm font-normal mb-4">Channels</h4>
              <ul className="space-y-2">
                {channels.map((channel) => (
                  <li key={channel.id}>
                    <a
                      href={channel.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {channel.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-normal mb-4">Groups</h4>
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li key={group.id}>
                    <a
                      href={group.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {group.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-normal mb-4">Social Platforms</h4>
              <ul className="space-y-2">
                {socials.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.Link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {s.Name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>

      <div className="border-t border-border -mx-6 px-6 pt-4 pb-4">
        <div className="flex flex-col items-center text-center gap-3 md:flex-row md:justify-between md:text-left">
          <p className="text-xs font-light text-muted-foreground">
            © 2025–{new Date().getFullYear()} {siteConfig?.name || ''}. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <AppLink href="/privacy-policy" className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </AppLink>
            <AppLink href="/terms-of-service" className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </AppLink>
            <AppLink href="/refund-exchange-policy" className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors">
              Refund & Exchange
            </AppLink>
            {policies.map((p) => (
              <AppLink
                key={p.id}
                href={`/policy/${policySlug(p.PolicyName as string)}`}
                className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors"
              >
                {p.PolicyName}
              </AppLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
