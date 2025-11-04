import { ExternalLink } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { EnrichmentResult } from '../../hooks/useUrlEnrichment';

interface MetadataPreviewCardProps {
  metadata: EnrichmentResult;
  url: string;
}

export function MetadataPreviewCard({ metadata, url }: MetadataPreviewCardProps) {
  const domain = extractDomain(url);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 transition-all">
      <div className="flex gap-3">
        {metadata.image && (
          <img
            src={metadata.image}
            alt={metadata.title}
            className="w-20 h-20 object-cover rounded flex-shrink-0"
            onError={(e) => {
              // Hide image if it fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
              {metadata.title}
            </h4>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0"
              data-tooltip-id="metadata-tooltip"
              data-tooltip-content={url}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-gray-500 mb-2">{domain}</p>
          {metadata.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {metadata.description}
            </p>
          )}
        </div>
      </div>
      <Tooltip id="metadata-tooltip" />
    </div>
  );
}

function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace('www.', '');
  } catch {
    return url;
  }
}
