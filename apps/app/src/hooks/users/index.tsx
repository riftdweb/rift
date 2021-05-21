import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import useSWR from 'swr'
import debounce from 'lodash/debounce'
import { socialDAC, userProfileDAC, useSkynet } from '../skynet'

const debouncedMutate = debounce((mutate) => {
  return mutate()
}, 5000)

export const suggestionUserIds = [
  // Hacker News
  'd723ded05f38603593d455fe0f5c4fee5d52e67d7d66dfd63c56c51cef22a999',
  // Reddit Popular
  '3e6cbb387e26f405d8394ad8df3d4aa4e945fdf3850bcae1b5b0f602c797b292',
  // Reddit Tech
  'a36a0ceb9b8535822a5a7f37f13a184736c8a60f89722207228ce3373827a39c',
  // Reddit CryptoCurrency
  '2898f8a41a1c8ffa7777b44530db8e4b1d47f1a5e39d68784d22d86704143d2c',
  // Reddit Siacoin
  '8762804ded167d2dd7dea9c0c81af70fa45a145e301eb8af2e9bfb5bbcc2f79f',
  // Redsolver
  '611f0e3730c028d618362aaaa19b00aa50bdf31480c627baf006abcc88f1c97a',
  // Napster
  '000d74966f9a6466bad354733df962a5fa55ba55cf767be4d1e8068f14912f94',
  // Italy
  '300c42cdd890af7c21021eff4491c8dc04f5f0c856b35a63a5ba84b4c6081e68',
  // Toto
  'e453031a0a0d574bc58259e3d077f0ccc01f0f2bf1c4e7bcd1d868b2e8af7377',
  // Serverless
  '0c47cbcd96ef115de2d2153b79f465bac19b1d5ca5b6ccea045d539f6a52d445',
  // Eric Flo
  'fbc7ab46a9c7f203dbf52e85a3ac124d4c89a09931269244941eeb96a35831f0',
  // MonkeyDream
  '55ad55bad856480fbcf09ec7fc6bf857812241ca2e82ae577724c4f8f2541df2',
  // StormHunter
  '67ffb4bf7b45191714d2aa00123fc45066066c1c8eaf0b61224ad41d012e948b',
  // Biker
  '472c7902e568d325781afc77804826cb0cbcc1c609ce03dffafb40fddfdb50bd',
]

// const RESOURCE_DATA_KEY = 'users'

type State = {
  followings: any[]
  suggestions: any[]
  handleFollow: (name: string, userId: string) => void
  handleUnfollow: (userId: string) => void
}

const UsersContext = createContext({} as State)
export const useUsers = () => useContext(UsersContext)

type Props = {
  children: React.ReactNode
}

export function UsersProvider({ children }: Props) {
  const { Api, userId: myUserId } = useSkynet()

  const [allSuggestions, setSuggestions] = useState<any[]>([])

  useEffect(() => {
    if (!suggestionUserIds || !suggestionUserIds.length) {
      return
    }
    const func = async () => {
      const profiles = []
      for (let userId of suggestionUserIds) {
        const profile = await userProfileDAC.getProfile(userId)
        profiles.push({
          userId,
          profile,
        })
      }

      setSuggestions(profiles)
    }
    func()
  }, [setSuggestions])

  const { data: followingUserIds, mutate } = useSWR(
    'followingList' + myUserId,
    () => socialDAC.getFollowingForUser(myUserId)
  )

  const [followings, setFollowings] = useState<any[]>([])

  useEffect(() => {
    if (!followingUserIds || !followingUserIds.length) {
      return
    }
    const func = async () => {
      const profiles = []
      for (let userId of followingUserIds) {
        const profile = await userProfileDAC.getProfile(userId)
        profiles.push({
          userId,
          profile,
        })
      }

      setFollowings(profiles)
    }
    func()
  }, [followingUserIds, setFollowings])

  // console.log(followingUserIds)
  // console.log(followings)

  const handleFollow = useCallback(
    (name, userId) => {
      const func = async () => {
        // mutate(followingUserIds.concat(userId), false)
        setFollowings(
          followings.concat({
            userId,
            profile: {
              username: name,
            },
          })
        )
        await socialDAC.follow(userId)
        debouncedMutate(mutate)
      }
      func()
    },
    [mutate, followingUserIds, followings, setFollowings]
  )

  const handleUnfollow = useCallback(
    (userId) => {
      const func = async () => {
        // mutate(
        //   followingUserIds.filter((fUserId) => fUserId !== userId),
        //   false
        // )
        setFollowings(
          followings.filter((following) => following.userId !== userId)
        )
        await socialDAC.unfollow(userId)
        debouncedMutate(mutate)
      }
      func()
    },
    [mutate, followingUserIds, followings, setFollowings]
  )

  const suggestions = allSuggestions.filter(
    (suggestion) =>
      !followings.find(({ userId }) => userId === suggestion.userId)
  )

  const value = {
    followings,
    suggestions,
    handleFollow,
    handleUnfollow,
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}
