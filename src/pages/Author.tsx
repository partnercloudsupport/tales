import ArticleCard from 'components/Card'
import { useAuthor } from 'hooks/useAuthor'
import useCurrentUser from 'hooks/useCurrentUser'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArticleType, Author } from 'types/types'
import { demoPost } from 'utils/constants'
// @ts-ignore
import * as fcl from '@onflow/fcl'
// @ts-ignore
import GetAllPartialArticles from '../cadence/scripts/GetAllPartialArticles.cdc'
import { OutputData } from '@editorjs/editorjs'

export type AuthorProps = {
    author: Author
}

function AuthorPage() {
    const [articles, setArticles] = React.useState<ArticleType[]>([])
    const [loading, setLoading] = React.useState<boolean>(false)

    const params = useParams()
    const authorAddress = params.id

    const { author, isAuthorLoading } = useAuthor(params.id)

    const user = useCurrentUser()

    useEffect(() => {
        const getMyArticles = async (address: string) => {
            let res;
            try {
              res = await fcl.query({
                cadence: GetAllPartialArticles,
                args: (arg: any, t: any) => [arg(address, t.Address)]
              })
            } catch(e) { res = []; console.log(e) }
            console.log("Res: ", res)
            return res
        }

        const getArticlesByAuthor = async (address: string) => {
            const articles = await getMyArticles(address)

            const myArticles = await Promise.all(articles.map(async (a: any) => { 
                let p = a.data as string
                
                // const data: OutputData = await fetch(p.replace("ipfs.io", "nftstorage.link")).then(res => res.json())

                return Promise.resolve({
                    authorAddress: a.author,
                    authorName: "",
                    authorDesc: "",
                    authorImg: "",
                    title: a.title,
                    content: "",
                    coverImg: a.image,
                    readTime: 0,
                    createdAt: new Date(parseInt(a.createDate) * 1000).toDateString(),
                    id: a.id,
                    likes: 0,
                })
            })) 

            setArticles(myArticles)
        }
        if (author && authorAddress) {
            if (author?.name)
                document.title = `${author.name} - Tales`

            getArticlesByAuthor(authorAddress)
        }
    }, [author, authorAddress])
    
    if (loading || isAuthorLoading) return <>Loading</>
    if (!author) return <div className='flex items-center justify-center text-lg'>Author not found</div>
    
    return (
        <div className='flex flex-col scroll-auto'>
            <div className='w-screen h-screen'>
                <div className='h-[40vh] bg-green-800'></div>
                <div className='py-10 bg-gray-100'>
                    <img
                        className='w-32 h-32 rounded-full mx-auto -mt-24 border-4 border-gray-100'
                        src={author.img}
                        alt='Author'
                    />
                    <div className='text-center'>
                        <h1 className='text-2xl font-black text-gray-800'>{author.name}</h1>
                        <p className='text-gray-600 text-sm'>{author.address}</p>
                        <p className='text-gray-600 py-4 text-base'>{author.description}</p>
                    </div>
                </div>
                <div className='my-10 mx-auto w-5/6 py-8 px-4  bg-gray-100 rounded-lg '>
                    <div className='flex justify-between items-center px-8'>
                        <div className='flex flex-col justify-center '>
                            <div>Subscibe to {author.name}</div>
                            <div>Receive updates directly in your inbox</div>
                        </div>
                        <div className='flex justify-center'>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className='w-80 px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent' />
                        <button className='bg-green-600 text-white px-4 py-2 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent'>Subscribe</button>
                    </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-20 w-5/6 mx-auto ">
                    {articles?.map((post) => (
                        <ArticleCard
                            key={post.id}
                            article={post}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AuthorPage