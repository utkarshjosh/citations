import { Container, Title, Text, Stack, SimpleGrid, Paper, Badge, Group } from '@mantine/core';
import { motion } from 'framer-motion';
import { useFeed } from '@hooks';
import { LoadingSpinner, ErrorMessage, PaperCard, SearchBar } from '@components';
import { useState } from 'react';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error, refetch } = useFeed({ page: 1, limit: 20 });

  const handleSearch = query => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log('Searching for:', query);
  };

  const handleSavePaper = paper => {
    console.log('Save paper:', paper);
    // TODO: Implement save functionality
  };

  const handleReadPaper = paper => {
    console.log('Read paper:', paper);
    // TODO: Navigate to paper detail page
  };

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <LoadingSpinner message="Loading papers..." size="lg" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <ErrorMessage
          title="Failed to load papers"
          message={error.message || 'Something went wrong. Please try again later.'}
          onRetry={refetch}
        />
      </Container>
    );
  }

  // Mock data for demonstration
  const mockPapers = [
    {
      id: '1',
      title: 'Attention Is All You Need: A Comprehensive Study of Transformer Architecture',
      summary:
        'This paper introduces the Transformer architecture, a novel neural network design that relies entirely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
      authors: ['Vaswani', 'Shazeer', 'Parmar', 'Uszkoreit'],
      category: 'Machine Learning',
      publishedDate: '2023-12-15',
      url: 'https://arxiv.org',
    },
    {
      id: '2',
      title: 'Deep Residual Learning for Image Recognition',
      summary:
        'We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.',
      authors: ['He', 'Zhang', 'Ren', 'Sun'],
      category: 'Computer Vision',
      publishedDate: '2023-12-10',
      url: 'https://arxiv.org',
    },
    {
      id: '3',
      title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
      summary:
        'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers.',
      authors: ['Devlin', 'Chang', 'Lee', 'Toutanova'],
      category: 'Natural Language Processing',
      publishedDate: '2023-12-08',
      url: 'https://arxiv.org',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <div>
            <Title
              order={1}
              style={{
                fontFamily: 'var(--font-family-headline)',
                fontSize: 'var(--font-size-4xl)',
                fontWeight: 'var(--font-weight-bold)',
                lineHeight: 'var(--line-height-tight)',
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              Citations
            </Title>
            <Text
              style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-normal)',
                lineHeight: 'var(--line-height-normal)',
                color: 'var(--color-text-secondary)',
                marginTop: 'var(--spacing-sm)',
              }}
            >
              Context at the Speed of Scroll
            </Text>
          </div>

          {/* Search Bar */}
          <SearchBar
            placeholder="Search papers by title, author, or topic..."
            onSearch={handleSearch}
          />

          {/* Stats */}
          <Paper p="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Total Papers
                </Text>
                <Text size="xl" fw={700}>
                  {mockPapers.length}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Categories
                </Text>
                <Text size="xl" fw={700}>
                  3
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Status
                </Text>
                <Badge color="green" variant="light">
                  Ready
                </Badge>
              </div>
            </Group>
          </Paper>

          {/* Papers Grid */}
          <div>
            <Title order={2} size="h3" mb="md">
              Latest Papers
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 1, md: 2, lg: 3 }} spacing="lg">
              {mockPapers.map(paper => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onSave={handleSavePaper}
                  onRead={handleReadPaper}
                  isSaved={false}
                />
              ))}
            </SimpleGrid>
          </div>

          {/* Tech Stack Info */}
          <Paper p="lg" withBorder mt="xl">
            <Title order={3} size="h4" mb="md">
              Frontend Stack
            </Title>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
              {[
                'React 18',
                'Vite',
                'React Router',
                'React Query',
                'Framer Motion',
                'Mantine UI',
                'Axios',
                'Path Aliases',
              ].map(tech => (
                <Badge key={tech} size="lg" variant="light">
                  {tech}
                </Badge>
              ))}
            </SimpleGrid>
          </Paper>
        </Stack>
      </Container>
    </motion.div>
  );
};

export default Home;
