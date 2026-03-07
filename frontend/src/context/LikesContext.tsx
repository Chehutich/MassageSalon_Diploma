import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LikesCtx = {
  likedIds: Set<string>;
  toggleLike: (id: string) => void;
};

const LikesContext = createContext<LikesCtx>({
  likedIds: new Set(),
  toggleLike: () => {},
});

export const LikesProvider = ({ children }: { children: ReactNode }) => {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem("likedIds").then((val) => {
      if (val) setLikedIds(new Set(JSON.parse(val)));
    });
  }, []);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      AsyncStorage.setItem("likedIds", JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <LikesContext.Provider value={{ likedIds, toggleLike }}>
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = () => useContext(LikesContext);
