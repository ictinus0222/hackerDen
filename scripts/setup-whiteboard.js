import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client();
const databases = new Databases(client);

client
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = 'whiteboard_objects';

async function setupWhiteboardCollection() {
    try {
        console.log('Setting up whiteboard collection...');

        // Create the collection
        const collection = await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'Whiteboard Objects',
            [
                Permission.read(Role.any()),
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
            ]
        );

        console.log('Collection created:', collection.name);

        // Create attributes
        const attributes = [
            { key: 'type', type: 'string', size: 50, required: true },
            { key: 'teamId', type: 'string', size: 50, required: true },
            { key: 'hackathonId', type: 'string', size: 50, required: true },
            { key: 'x', type: 'double', required: true },
            { key: 'y', type: 'double', required: true },
            { key: 'width', type: 'double', required: false },
            { key: 'height', type: 'double', required: false },
            { key: 'color', type: 'string', size: 20, required: false },
            { key: 'fillColor', type: 'string', size: 20, required: false },
            { key: 'strokeWidth', type: 'integer', required: false },
            { key: 'points', type: 'string', size: 10000, required: false },
            { key: 'imageUrl', type: 'string', size: 100000, required: false }
        ];

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.size,
                        attr.required
                    );
                } else if (attr.type === 'double') {
                    await databases.createFloatAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.required
                    );
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.required
                    );
                }

                console.log(`Created attribute: ${attr.key}`);

                // Wait a bit between attribute creations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                if (error.code === 409) {
                    console.log(`Attribute ${attr.key} already exists`);
                } else {
                    console.error(`Error creating attribute ${attr.key}:`, error);
                }
            }
        }

        console.log('Whiteboard collection setup complete!');
        console.log('You can now use the whiteboard at /whiteboard');

    } catch (error) {
        if (error.code === 409) {
            console.log('Collection already exists, checking attributes...');

            // If collection exists, just try to create missing attributes
            const attributes = [
                { key: 'type', type: 'string', size: 50, required: true },
                { key: 'teamId', type: 'string', size: 50, required: true },
                { key: 'hackathonId', type: 'string', size: 50, required: true },
                { key: 'x', type: 'double', required: true },
                { key: 'y', type: 'double', required: true },
                { key: 'width', type: 'double', required: false },
                { key: 'height', type: 'double', required: false },
                { key: 'color', type: 'string', size: 20, required: false },
                { key: 'fillColor', type: 'string', size: 20, required: false },
                { key: 'strokeWidth', type: 'integer', required: false },
                { key: 'points', type: 'string', size: 10000, required: false },
                { key: 'imageUrl', type: 'string', size: 100000, required: false }
            ];

            for (const attr of attributes) {
                try {
                    if (attr.type === 'string') {
                        await databases.createStringAttribute(
                            DATABASE_ID,
                            COLLECTION_ID,
                            attr.key,
                            attr.size,
                            attr.required
                        );
                    } else if (attr.type === 'double') {
                        await databases.createFloatAttribute(
                            DATABASE_ID,
                            COLLECTION_ID,
                            attr.key,
                            attr.required
                        );
                    } else if (attr.type === 'integer') {
                        await databases.createIntegerAttribute(
                            DATABASE_ID,
                            COLLECTION_ID,
                            attr.key,
                            attr.required
                        );
                    }

                    console.log(`Created missing attribute: ${attr.key}`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (attrError) {
                    if (attrError.code === 409) {
                        console.log(`Attribute ${attr.key} already exists`);
                    } else {
                        console.error(`Error creating attribute ${attr.key}:`, attrError);
                    }
                }
            }
        } else {
            console.error('Error setting up collection:', error);
        }
    }
}

setupWhiteboardCollection();