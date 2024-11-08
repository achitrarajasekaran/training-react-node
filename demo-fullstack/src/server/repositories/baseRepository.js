/**
 * Base Repository Interface
 * Defines standard operations to be implemented by concrete repositories
 */
class BaseRepository {
    constructor() {
        if (this.constructor === BaseRepository) {
            throw new Error('Cannot instantiate abstract class');
        }
    }

    async create(data) {
        throw new Error('Method not implemented');
    }

    async findById(id) {
        throw new Error('Method not implemented');
    }

    async findAll() {
        throw new Error('Method not implemented');
    }

    async update(id, data) {
        throw new Error('Method not implemented');
    }

    async delete(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = BaseRepository;
