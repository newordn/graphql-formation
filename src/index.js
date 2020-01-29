const { GraphQLServer } = require('graphql-yoga')
const {prisma} = require('./generated/prisma-client')
const utilisateurs = []
const posts = []
let tokens = []
const typeDefs = `
type Query {
  utilisateurs: [User]
  info: String!
  posts: [Post]
  allPosts: [Post]
}
type Post{
  id:ID!
  sujet:String
  contenu:String
  statut:Boolean
  createdAt: String
  postedBy: User
}
type Mutation{
  validationPost(id:ID!):Post
  creationPost(sujet:String,contenu:String,token:String): Post
  CreationPostPrisma(sujet:String, token:String): Post
  inscriptionPrisma(noms:String,mot_de_passe:String,date_naissance:String): User
  inscription(noms:String,phone:String,mot_de_passe:String,date_naissance:String): User
  connexion(phone:String,mot_de_passe:String): AuthPayload
}
type AuthPayload{
  user:User
  token:String
}
type User{
  id: ID!
  admin:Boolean
  noms:String
  phone:String
  mot_de_passe:String
  date_naissance:String
  posts: [Post]
  createdAt: String
}
`
const dateActuelle = ()=>{
  const date = new Date() // on cree un objet qui contient la date du jour
return date.getFullYear().toString() + "-0"+ (date.getMonth()+1).toString() + "-"+ date.getDate().toString()
}
const getUserById = (id)=>{
  //utilisateurs.map(user=>user.id===id)
 const user = utilisateurs.filter(user=>user.id===id)[0]
 return user
}
const getIdByToken = (token)=>{
 return  utilisateurs[tokens.indexOf(token)].id
}
const getPostId = (id)=>{
  console.log(id)
 const post = posts.filter(post=>{
   console.log(post.id==id)
  return  post.id==id})[0]
 return post 
}
const resolvers = {
  Query: {
    info: () => {console.log('on est dans la fonction info'); return `This is the api for graphql-formation`},
    utilisateurs: ()=>utilisateurs,
    posts: ()=>{
      return posts.filter(post=>post.statut===true) 
     },
     allPosts: ()=>{
      return posts
     }
  },
  Mutation:{
    inscriptionPrisma: async  (parent,args,context,info)=>{
     const user = await  prisma.createUser({...args})
     return user
    },
    inscription: (parent,args,context,info)=>{
      console.log("dans inscription")
      const user = args// recupere les informations de l'utilisateur
      user.admin = false
      // recuperer le telephone
      const phone =args.phone 
      // recuperer la liste des numeros des utilisateurs qu'on a (map)
      const phones= utilisateurs.map(phone=> phone.phone)
      // verifier si le telephone est dans cette liste ou pas
      if(phones.includes(phone)){
        // si oui
        throw "utilisateur est déjà inscrit"
      } else { 
      // si non...
      // construit la date a afficher a l'utilisateur
     user.id= new Date().getTime() 
     user.posts = []
     user.createdAt = dateActuelle()
     // ajoute le nouvel utilisateur a la liste des utilisateurs
      utilisateurs.push(user)
      tokens.push(false)
      // retourne le premier utilisateur
      return utilisateurs[utilisateurs.length-1]
    }
  },
  CreationPostPrisma: async (parent, args, context, info)=>{
const post = await prisma.CreatePost{...args, statut:false}
return post
  }
    creationPost: (parent,args,context,info)=>{
      
      const post = {...args, statut:false,createdAt: dateActuelle()}
      post.id= new Date().getTime()
      const token = args.token
      // verifie si l'utilisateur est connecte
        if(tokens.includes(token))
        {
          const id = getIdByToken(token)
          const user = getUserById(id)
          post.postedBy = user
          user.posts.push(post)
          
        // si oui on recupere l'id de l'utilisateur connecte
        }
        // si non il se doit se connecter d'abord
        else{
          throw "Connectez vous d'abord avant de pouvoir poster"
        }
        // on cree le post
        posts.push(post)
        return post

    },
    validationPost: (parent,args,context,info) => {
      const user = getUserById(estConnecte)
      if(!user.admin) throw 'Vous devez etre administrateur pour valider un post'
      
      const post = getPostId(args.id)
      post.statut= true 
      return post;
    }
    ,
    connexion: (parent,args,context,info)=>{
      // parse les donnees 
      const phone = args.phone
      const password = args.mot_de_passe
      // verification de l'existence de l'utilisateur
      for(i=0;i<=utilisateurs.length-1;i++){
        if(utilisateurs[i].phone===phone){
            console.log("l'user est chez nouss")
            if(utilisateurs[i].mot_de_passe===password){
                console.log('il est connecte')
                estConnecte =  utilisateurs[i].id
                tokens[i] = (Math.random()*1000).toString()
                return {user: utilisateurs[i],token:tokens[i]}
            }
            else{
                console.log('le mot de passe ne correspond pas')
                throw "Mot de passe incorrect"
            }
        }  
        else if(i===utilisateurs.length-1)
        {
            console.log("l'utilisateur n'est pas chez nous")
            throw "Utilisateur n'existe pas"
        }
        }
      }
    }
  }



const server = new GraphQLServer({
  typeDefs,
  resolvers,
})
server.start(() => console.log(`Server is running on http://localhost:4000`))