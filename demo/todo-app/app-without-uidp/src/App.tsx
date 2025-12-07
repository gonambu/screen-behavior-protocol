import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { TodoProvider } from './TodoContext';
import { TodoList } from './TodoList';
import { TodoDetail } from './TodoDetail';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TodoProvider>
        <BrowserRouter>
          <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'grey.100' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/todos" replace />} />
              <Route path="/todos" element={<TodoList />} />
              <Route path="/todos/:id" element={<TodoDetail />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </TodoProvider>
    </ThemeProvider>
  );
}

export default App;
