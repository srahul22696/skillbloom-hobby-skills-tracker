import test,{before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {collection,deleteDoc,doc,getDoc,getDocs,setDoc,updateDoc} from 'firebase/firestore';

let env;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-skillbloom',firestore:{rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}})});
after(async()=>{await env?.cleanup()});
beforeEach(async()=>{await env.clearFirestore()});

test('private user documents and subcollections are isolated by auth uid',async()=>{
 const alice=env.authenticatedContext('alice').firestore(),bob=env.authenticatedContext('bob').firestore();
 await assertSucceeds(setDoc(doc(alice,'users/alice'),{name:'Alice'}));
 await assertSucceeds(setDoc(doc(alice,'users/alice/skills/guitar'),{name:'Guitar'}));
 await assertSucceeds(getDoc(doc(alice,'users/alice/skills/guitar')));
 await assertFails(getDoc(doc(bob,'users/alice/skills/guitar')));
 await assertFails(setDoc(doc(bob,'users/alice/skills/other'),{name:'Nope'}));
 await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'users/alice')));
});

test('community posts are readable to members but only owners can create or edit',async()=>{
 const alice=env.authenticatedContext('alice').firestore(),bob=env.authenticatedContext('bob').firestore();
 await assertSucceeds(setDoc(doc(alice,'posts/post-1'),{userId:'alice',text:'Practiced watercolor today.'}));
 await assertSucceeds(getDoc(doc(bob,'posts/post-1')));
 await assertFails(setDoc(doc(bob,'posts/forged'),{userId:'alice',text:'I am Alice'}));
 await assertFails(updateDoc(doc(bob,'posts/post-1'),{text:'Changed by someone else'}));
 await assertFails(setDoc(doc(alice,'posts/short'),{userId:'alice',text:'ok'}));
 await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'posts/post-1')));
});

test('likes are one doc per uid and comment writes/deletes are owner-scoped',async()=>{
 const alice=env.authenticatedContext('alice').firestore(),bob=env.authenticatedContext('bob').firestore();
 await assertSucceeds(setDoc(doc(alice,'posts/post-1'),{userId:'alice',text:'A longer valid post.'}));
 await assertSucceeds(setDoc(doc(alice,'posts/post-1/likes/alice'),{userId:'alice'}));
 await assertFails(setDoc(doc(bob,'posts/post-1/likes/alice'),{userId:'alice'}));
 await assertSucceeds(setDoc(doc(bob,'posts/post-1/comments/comment-1'),{userId:'bob',name:'Bob',text:'Nice work!'}));
 await assertFails(deleteDoc(doc(alice,'posts/post-1/comments/comment-1')));
 await assertSucceeds(deleteDoc(doc(bob,'posts/post-1/comments/comment-1')));
 await assertFails(setDoc(doc(bob,'posts/post-1/comments/blank'),{userId:'bob',text:''}));
});
