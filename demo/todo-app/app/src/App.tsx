import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { TodoProvider } from './context/TodoContext';
import { TodoList } from './screens/TodoList';
import { TodoDetail } from './screens/TodoDetail';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TodoProvider>
        <BrowserRouter>
          <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'grey.100' }}>
            <Routes>
              {/* flows: initial: TodoList */}
              <Route path="/" element={<Navigate to="/todos" replace />} />
              {/* route: /todos */}
              <Route path="/todos" element={<TodoList />} />
              {/* route: /todos/:id */}
              <Route path="/todos/:id" element={<TodoDetail />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </TodoProvider>
    </ThemeProvider>
  );
}

export default App;
