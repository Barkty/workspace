import { Like } from "typeorm";
import { paginate } from "../helpers/paginate";
import { IBlog } from "../interfaces";
import Blog from "../models/Blog.entity";
import BadRequest from "../utils/badRequest";
import { createCustomError } from "../utils/customError";
import { AppDataSource } from "../services/database";

class BlogRepository {
    private repo: any
    constructor() {
        this.repo = AppDataSource.getRepository(Blog)
    }

    findAll = async (page: number, limit: number, title: string) => {
        try {
            const skip = page === 1 ? 0 : (limit * page)
            let blogs

            if (title !== 'undefined') {
                blogs = await this.repo.findAndCount({
                    where: {
                        title: Like(`%${title}%`),
                    },
                    order: {
                        id: "ASC",
                    },
                    relations: {
                        comments: true,
                    },
                    skip,
                    take: limit
                })

            } else {

                blogs = await this.repo.findAndCount({
                    order: {
                        id: "ASC",
                    },
                    skip,
                    take: limit
                })
            }

            const result = paginate(blogs, page, limit)

            return result
        } catch (e) {
            throw e
        }
    }

    findOne = async (id: any) => {
        try {

            const blog = await this.repo.findOne({
                where: {
                    id: id
                },
                relations: {
                    comments: true,
                },
            })

            return blog
        } catch (e) {
            throw e
        }
    }

    create = async (blog: IBlog) => {
        try {
            let found = await this.repo.findOneBy({ title: blog.title })
            
            if (found) {
                throw new BadRequest('Blog already exist', 400)
            }

            found = this.repo.create({ ...blog })

            return await this.repo.save(found)

        } catch (e) {
            throw e
        }
    }

    removeOne = async (id: number) => {

        try {
            const user = await this.findOne(id)
        
            return await this.repo.remove(user)
            
        } catch (e) {
            throw e
        }
    }

    updateOne = async (id: number, updates: Partial<IBlog>) => {

        try {
            
          const blog = await this.findOne(id)
    
          if (!blog) throw createCustomError('Blog does not exist', 404)

          let likes = blog.likes
          
          Object.assign(blog, updates)

          console.log('LIKES:: ', blog)

          if (updates.likes) {
            likes += 1
            blog.likes = likes
          }
    
          return await this.repo.save(blog)
    
        } catch (e) {
          throw e
        }
    }
    
}

export default BlogRepository