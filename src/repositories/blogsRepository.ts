import {IRequestBlogModel} from "../models/models";
import {IBlog} from "../models/models";

const blogsArrayDB: IBlog[] = [];
let id: number = 0;

export const blogsRepository = {
    getAllBlogs(): IBlog[] {
        return blogsArrayDB;
    },
    createNewBlog(newBlog: IRequestBlogModel): IBlog{
        id++;
        const createdBlog: IBlog = {
            id: String(id),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl
        };
        blogsArrayDB.push(createdBlog);
        return createdBlog;
    },
    getBlogByID(id: string){
        return blogsArrayDB.find(elem => elem.id === id);
    },
    // возвращает false если такого объекта в базе данных нет
    // и true если операция прошла успешно
    updateBlogByID(id: string, blog: IRequestBlogModel): false | true {
        const findElemByID = blogsArrayDB.find(elem => elem.id === id);
        if (!findElemByID) {
            return false;
        }
        const otherElementsOfArray = blogsArrayDB.filter(elem => elem.id !== id);
        blogsArrayDB.splice(0);
        blogsArrayDB.push({
            id: findElemByID.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl
        });
        blogsArrayDB.push(...otherElementsOfArray);
        return true;
    },
    // возвращает false если такого объекта нет в базе данных
    // и true если успешно прошла операция
    deleteBlogByID(id: string): false | true {
        const findElemByID = blogsArrayDB.find(elem => elem.id === id);
        if (!findElemByID) {
            return false;
        }
        const otherElementsOfArray = blogsArrayDB.filter(elem => elem.id !== id);
        blogsArrayDB.splice(0);
        blogsArrayDB.push(...otherElementsOfArray);
        return true;
    },
    findBlogNameByID(id: string) {
        const desiredElem = blogsArrayDB.find(elem => elem.id === id);
        if (desiredElem) return desiredElem.name;
        return 'undefined';
    }
}
