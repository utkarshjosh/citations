import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Stack,
  Button,
  Paper,
  Group,
  Checkbox,
  Box,
  Center,
  Grid,
} from '@mantine/core';
import { motion } from 'framer-motion';
import {
  IconBrain,
  IconRocket,
  IconSparkles,
  IconCpu,
  IconLanguage,
  IconEye,
  IconRobot,
  IconNetwork,
} from '@tabler/icons-react';
import { LogoIcon } from '@components';

const CATEGORIES = [
  {
    id: 'cs.AI',
    name: 'Artificial Intelligence',
    icon: IconRobot,
    description: 'AI systems, reasoning, and intelligent agents',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'cs.LG',
    name: 'Machine Learning',
    icon: IconBrain,
    description: 'Neural networks, deep learning, and ML algorithms',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  },
  {
    id: 'cs.CL',
    name: 'Natural Language Processing',
    icon: IconLanguage,
    description: 'Language models, text processing, and linguistics',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 'cs.CV',
    name: 'Computer Vision',
    icon: IconEye,
    description: 'Image recognition, visual understanding, and graphics',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    id: 'cs.NE',
    name: 'Neural & Evolutionary Computing',
    icon: IconNetwork,
    description: 'Neural architectures and evolutionary algorithms',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = categoryId => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleStartScrolling = () => {
    if (selectedCategories.length === 0) {
      // If no categories selected, select all by default
      const allCategories = CATEGORIES.map(cat => cat.id);
      localStorage.setItem('selectedCategories', JSON.stringify(allCategories));
    } else {
      localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    }
    navigate('/feed');
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'var(--color-background)',
        padding: '2rem 0',
        position: 'relative',
        overflow: 'auto',
      }}
    >
      {/* Animated gradient background */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          opacity: 0.15,
          zIndex: 0,
        }}
      />

      {/* Floating orbs for visual interest */}
      <Box
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />
      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Stack gap="xl" align="center">
            {/* Hero Section */}
            <Center>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <LogoIcon size={80} color="var(--color-text)" />
              </motion.div>
            </Center>

            <Stack gap="md" align="center" style={{ textAlign: 'center' }}>
              <Title
                order={1}
                style={{
                  fontFamily: 'var(--font-family-headline)',
                  fontSize: 'var(--font-size-5xl)',
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
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: 'var(--line-height-normal)',
                  color: 'var(--color-text-secondary)',
                  maxWidth: '600px',
                  margin: 0,
                }}
              >
                Unlock the frontier of AI & CS. Personalized insights, no noise.
              </Text>

              <Group gap="lg" mt="md">
                <Group gap="xs">
                  <IconSparkles size={20} color="var(--color-accent)" />
                  <Text
                    style={{
                      fontFamily: 'var(--font-family-body)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    AI-Powered Summaries
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconRocket size={20} color="var(--color-accent)" />
                  <Text
                    style={{
                      fontFamily: 'var(--font-family-body)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Daily Updates
                  </Text>
                </Group>
              </Group>
            </Stack>

            {/* Category Selection */}
            <Paper
              shadow="xl"
              p="xl"
              radius="lg"
              style={{
                width: '100%',
                maxWidth: '900px',
                marginTop: '2rem',
                background: 'var(--color-surface)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Stack gap="lg">
                <div>
                  <Title order={2} size="h3" mb="xs" style={{ color: 'var(--color-text)' }}>
                    Choose Your Interests
                  </Title>
                  <Text size="sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Select topics you'd like to explore (or skip to see everything)
                  </Text>
                </div>

                <Grid gutter="md">
                  {CATEGORIES.map(category => {
                    const Icon = category.icon;
                    const isSelected = selectedCategories.includes(category.id);

                    return (
                      <Grid.Col key={category.id} span={{ base: 12, sm: 6 }}>
                        <motion.div whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}>
                          <Paper
                            p="lg"
                            radius="xl"
                            style={{
                              cursor: 'pointer',
                              background: isSelected ? category.gradient : 'var(--color-surface)',
                              border: isSelected
                                ? '2px solid var(--color-accent)'
                                : '2px solid var(--color-border)',
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                            }}
                            onClick={() => toggleCategory(category.id)}
                          >
                            <Group wrap="nowrap" align="flex-start" gap="md">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => {}}
                                size="lg"
                                color="white"
                                styles={{
                                  input: {
                                    cursor: 'pointer',
                                    backgroundColor: isSelected
                                      ? 'rgba(255, 255, 255, 0.3)'
                                      : 'transparent',
                                    borderColor: isSelected
                                      ? 'rgba(255, 255, 255, 0.5)'
                                      : 'var(--color-border)',
                                  },
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <Group gap="xs" mb="xs">
                                  {category.icon === LogoIcon ? (
                                    <LogoIcon
                                      size={24}
                                      color={isSelected ? 'white' : 'var(--color-text)'}
                                    />
                                  ) : (
                                    <Icon
                                      size={24}
                                      color={isSelected ? 'white' : 'var(--color-text)'}
                                    />
                                  )}
                                  <Text
                                    fw={700}
                                    size="md"
                                    style={{ color: isSelected ? 'white' : 'var(--color-text)' }}
                                  >
                                    {category.name}
                                  </Text>
                                </Group>
                                <Text
                                  size="sm"
                                  style={{
                                    color: isSelected ? 'white' : 'var(--color-text-secondary)',
                                  }}
                                >
                                  {category.description}
                                </Text>
                              </div>
                            </Group>
                          </Paper>
                        </motion.div>
                      </Grid.Col>
                    );
                  })}
                </Grid>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ width: '100%' }}
                >
                  <Button
                    size="xl"
                    radius="xl"
                    fullWidth
                    onClick={handleStartScrolling}
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      marginTop: '1rem',
                      height: '60px',
                      fontSize: '18px',
                      fontWeight: 700,
                      boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4)',
                      border: 'none',
                    }}
                  >
                    <Group gap="sm">
                      <IconRocket size={24} />
                      <Text>Start Scrolling</Text>
                    </Group>
                  </Button>
                </motion.div>

                <Text size="xs" ta="center" style={{ color: 'var(--color-text-secondary)' }}>
                  No signup required • Free forever • Updated daily
                </Text>
              </Stack>
            </Paper>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Landing;
