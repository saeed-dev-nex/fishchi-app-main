import { Article, Book, Language, School } from '@mui/icons-material';
export const getSourceTypeIcon = (type: string) => {
  if (type === 'article') {
    return <Article />;
  } else if (type === 'book') {
    return <Book />;
  } else if (type === 'thesis') {
    return <School />;
  } else if (type === 'website') {
    return <Language />;
  } else {
    return <div />;
  }
};
export const getSourceTypeColor = (type: string) => {
  if (type === 'article') {
    return 'primary';
  } else if (type === 'book') {
    return 'secondary';
  } else if (type === 'thesis') {
    return 'success';
  } else if (type === 'website') {
    return 'warning';
  } else {
    return 'primary';
  }
};
