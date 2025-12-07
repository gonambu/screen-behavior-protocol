import { BrowserRouter, useSearchParams } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { TodoProvider } from './TodoContext';
import { TodoList } from './TodoList';
import { TodoDetail } from './TodoDetail';

const theme = createTheme();

// URLの設計は図に無いので、クエリパラメータ方式を選択
// UIDP版は /todos/:id だったが、ここでは /?id=xxx を使用
function AppContent() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  // idがあれば詳細、なければ一覧
  return id ? <TodoDetail /> : <TodoList />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TodoProvider>
        <BrowserRouter>
          <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'grey.100' }}>
            <AppContent />
          </Box>
        </BrowserRouter>
      </TodoProvider>
    </ThemeProvider>
  );
}

export default App;
