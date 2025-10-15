import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { updateSettingsSection } from '../store/features/settingsSlice';

interface IExportContext {
  exportSettings: {
    defaultFormat: 'bibtex' | 'ris' | 'apa' | 'mla' | 'chicago';
    includeAbstract: boolean;
    includeKeywords: boolean;
    includeDOI: boolean;
    includeURL: boolean;
  };
  setExportSetting: (
    key: keyof IExportContext['exportSettings'],
    value: any
  ) => void;
  exportSources: (sources: any[], format?: string) => void;
}

const ExportContext = createContext<IExportContext | undefined>(undefined);

export const ExportProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSelector((state: RootState) => state.settings);

  const exportSettings = settings?.export || {
    defaultFormat: 'bibtex',
    includeAbstract: true,
    includeKeywords: true,
    includeDOI: true,
    includeURL: true,
  };

  const setExportSetting = (
    key: keyof IExportContext['exportSettings'],
    value: any
  ) => {
    dispatch(
      updateSettingsSection({
        section: 'export',
        data: {
          ...exportSettings,
          [key]: value,
        },
      })
    );
  };

  const exportSources = (sources: any[], format?: string) => {
    const exportFormat = format || exportSettings.defaultFormat;

    // Generate export content based on format
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (exportFormat) {
      case 'bibtex':
        content = generateBibTeX(sources);
        filename = 'sources.bib';
        mimeType = 'application/x-bibtex';
        break;
      case 'ris':
        content = generateRIS(sources);
        filename = 'sources.ris';
        mimeType = 'application/x-research-info-systems';
        break;
      case 'apa':
        content = generateAPA(sources);
        filename = 'sources.txt';
        mimeType = 'text/plain';
        break;
      case 'mla':
        content = generateMLA(sources);
        filename = 'sources.txt';
        mimeType = 'text/plain';
        break;
      case 'chicago':
        content = generateChicago(sources);
        filename = 'sources.txt';
        mimeType = 'text/plain';
        break;
      default:
        content = generateBibTeX(sources);
        filename = 'sources.bib';
        mimeType = 'application/x-bibtex';
    }

    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper functions for different export formats
  const generateBibTeX = (sources: any[]) => {
    return sources
      .map((source) => {
        const key = `${source.authors?.[0]?.name?.split(' ')[0] || 'Unknown'}${
          source.year || ''
        }`;
        let bibtex = `@article{${key},\n`;
        bibtex += `  title = {${source.title || ''}},\n`;
        bibtex += `  author = {${
          source.authors?.map((a) => a.name).join(' and ') || ''
        }},\n`;
        bibtex += `  journal = {${source.journal || ''}},\n`;
        bibtex += `  year = {${source.year || ''}},\n`;
        if (exportSettings.includeDOI && source.doi) {
          bibtex += `  doi = {${source.doi}},\n`;
        }
        if (exportSettings.includeURL && source.url) {
          bibtex += `  url = {${source.url}},\n`;
        }
        if (exportSettings.includeAbstract && source.abstract) {
          bibtex += `  abstract = {${source.abstract}},\n`;
        }
        if (exportSettings.includeKeywords && source.tags?.length) {
          bibtex += `  keywords = {${source.tags.join(', ')}},\n`;
        }
        bibtex += `}\n\n`;
        return bibtex;
      })
      .join('');
  };

  const generateRIS = (sources: any[]) => {
    return sources
      .map((source) => {
        let ris = '';
        ris += `TY  - JOUR\n`;
        ris += `TI  - ${source.title || ''}\n`;
        ris += `AU  - ${
          source.authors?.map((a) => a.name).join('\nAU  - ') || ''
        }\n`;
        ris += `JO  - ${source.journal || ''}\n`;
        ris += `PY  - ${source.year || ''}\n`;
        if (exportSettings.includeDOI && source.doi) {
          ris += `DO  - ${source.doi}\n`;
        }
        if (exportSettings.includeURL && source.url) {
          ris += `UR  - ${source.url}\n`;
        }
        if (exportSettings.includeAbstract && source.abstract) {
          ris += `AB  - ${source.abstract}\n`;
        }
        if (exportSettings.includeKeywords && source.tags?.length) {
          ris += `KW  - ${source.tags.join('; ')}\n`;
        }
        ris += `ER  - \n\n`;
        return ris;
      })
      .join('');
  };

  const generateAPA = (sources: any[]) => {
    return sources
      .map((source) => {
        const authors =
          source.authors?.map((a) => a.name).join(', ') || 'Unknown';
        const year = source.year || 'n.d.';
        const title = source.title || 'Untitled';
        const journal = source.journal || 'Unknown Journal';

        let apa = `${authors} (${year}). ${title}. ${journal}`;
        if (exportSettings.includeDOI && source.doi) {
          apa += `. https://doi.org/${source.doi}`;
        } else if (exportSettings.includeURL && source.url) {
          apa += `. ${source.url}`;
        }
        apa += '.\n\n';
        return apa;
      })
      .join('');
  };

  const generateMLA = (sources: any[]) => {
    return sources
      .map((source) => {
        const authors =
          source.authors?.map((a) => a.name).join(', ') || 'Unknown';
        const title = source.title || 'Untitled';
        const journal = source.journal || 'Unknown Journal';
        const year = source.year || 'n.d.';

        let mla = `${authors}. "${title}." ${journal}, ${year}`;
        if (exportSettings.includeDOI && source.doi) {
          mla += `, https://doi.org/${source.doi}`;
        } else if (exportSettings.includeURL && source.url) {
          mla += `, ${source.url}`;
        }
        mla += '.\n\n';
        return mla;
      })
      .join('');
  };

  const generateChicago = (sources: any[]) => {
    return sources
      .map((source) => {
        const authors =
          source.authors?.map((a) => a.name).join(', ') || 'Unknown';
        const title = source.title || 'Untitled';
        const journal = source.journal || 'Unknown Journal';
        const year = source.year || 'n.d.';

        let chicago = `${authors}. "${title}." ${journal} (${year})`;
        if (exportSettings.includeDOI && source.doi) {
          chicago += `: ${source.doi}`;
        } else if (exportSettings.includeURL && source.url) {
          chicago += `: ${source.url}`;
        }
        chicago += '.\n\n';
        return chicago;
      })
      .join('');
  };

  const value = {
    exportSettings,
    setExportSetting,
    exportSources,
  };

  return (
    <ExportContext.Provider value={value}>{children}</ExportContext.Provider>
  );
};

export const useExport = () => {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error('useExport must be used within an ExportProvider');
  }
  return context;
};
